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
  CONFIG.Actor.entityClass = HitosActor;
  CONFIG.Item.entityClass = HitosItem;

  CONFIG.hitos = hitos;

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