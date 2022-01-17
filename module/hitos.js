// Import Modules
import { hitos} from "./config.js";
import * as Chat from "./chat.js";
import { HitosActor } from "./actor/actor.js";
import { HitosActorSheet } from "./actor/actor-sheet.js";
import { HitosItem } from "./item/item.js";
import { HitosItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function() {

  game.hitos = {
    HitosActor,
    HitosItem
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "3d10dh1kh1 + @iniciativa",
    decimals: 0
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = HitosActor;
  CONFIG.Item.documentClass = HitosItem;

  CONFIG.hitos = hitos;


  // Override the default Token _drawBar function.
  Token.prototype._drawBar = function (number, bar, data) {
    let val = Number(data.value);

    if (data.attribute === "resistencia" || data.attribute === "estabilidadmental") {
      val = Number(data.max - data.value);
    }

    const pct = Math.clamped(val, 0, data.max) / data.max;
    let h = Math.max(canvas.dimensions.size / 12, 8);
    if (this.data.height >= 2) h *= 1.6; // Enlarge the bar for large tokens
    // Draw the bar
    let color = number === 0 ? [1 - pct / 2, pct, 0] : [0.5 * pct, 0.7 * pct, 0.5 + pct / 2];
    bar
      .clear()
      .beginFill(0x000000, 0.5)
      .lineStyle(2, 0x000000, 0.9)
      .drawRoundedRect(0, 0, this.w, h, 3)
      .beginFill(PIXI.utils.rgb2hex(color), 0.8)
      .lineStyle(1, 0x000000, 0.8)
      .drawRoundedRect(1, 1, pct * (this.w - 2), h - 2, 2);
    // Set position
    let posY = number === 0 ? this.h - h : 0;
    bar.position.set(0, posY);
  };



  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("hitos", HitosActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("hitos", HitosItemSheet, { makeDefault: true });

  Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue,
    }[operator];
  });

  Handlebars.registerHelper("contains", function (obj1, property, value, opts) {
    let bool = false;
    if (Array.isArray(obj1)) {
      bool = obj1.some((e) => e[property] === value);
    } else if (typeof obj1 === "object") {
      bool = Object.keys(obj1).some(function (k) {
        return obj1[k][property] === value;
      });
    } else if (typeof obj1 === "string") {
      return obj1.includes(property);
    }

    if (bool) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  }); 

   // Register Handlebars utilities
   Handlebars.registerHelper("json", JSON.stringify);

   // Allows {if X = Y} type syntax in html using handlebars
   Handlebars.registerHelper("iff", function (a, operator, b, opts) {
     var bool = false;
     switch (operator) {
       case "==":
         bool = a == b;
         break;
       case "===":
           bool = a === null;
           break;
       case "!==":
             bool = a !== null;
             break;
       case ">":
         bool = a > b;
         break;
       case "<":
         bool = a < b;
         break;
       case "!=":
         bool = a != b;
         break;
       case "contains":
         if (a && b) {
           bool = a.includes(b);
         } else {
           bool = false;
         }
         break;
       default:
         throw "Unknown operator " + operator;
     }
 
     if (bool) {
       return opts.fn(this);
     } else {
       return opts.inverse(this);
     }
   });

  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('enrich', function(str) {
    return TextEditor.enrichHTML(str);
  });

  Handlebars.registerHelper("times", function (n, content){
    let result = "";
    for (let i=0;i <n; ++i){
      result += content.fn(i);
  }
    return result;
  });


  Handlebars.registerHelper("log", function(something) {
    console.log(something);
  });
});


Hooks.on("renderChatLog", (app,html,data) => Chat.addChatListeners(html));