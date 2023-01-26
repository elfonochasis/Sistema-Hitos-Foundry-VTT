import { _onCheckRoll, _onInitRoll, _onAttackRoll, _onStatusRoll, _onDramaRoll} from '../dice.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class HitosActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);
  }
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["hitos", "sheet", "actor"],
      template: "systems/hitos/templates/actor/actor-sheet.html",
      width: 740,
      height: 700,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "stats",
      }, ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/hitos/templates/actor";
    // Return a single sheet for all item types.
    return `${path}/${this.actor.type}-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    // return `${path}/${this.item.data.type}-sheet.html`;
  }
  /* -------------------------------------------- */
  async _enrichTextFields(data, fieldNameArr) {
    for (let t = 0; t < fieldNameArr.length; t++) {
      if (hasProperty(data, fieldNameArr[t])) {
        setProperty(data, fieldNameArr[t], await TextEditor.enrichHTML(getProperty(data, fieldNameArr[t]), { async: true }));
      }
    };
  }

  /** @override */
  async getData() {
    const baseData = super.getData();
    console.log(baseData)
    let sheetData = {
      editable: this.isEditable,
      actor: baseData.actor,
      system: baseData.actor.system,
      items: baseData.items,
      dtypes: ["String", "Number", "Boolean"]
    }
    this._prepareCharacterItems(sheetData);

    
    let enrichedFields = [
      "system.biografia",
      "system.extras",
    ];
    await this._enrichTextFields(baseData, enrichedFields);


    return sheetData;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    //html.on("change", "div[contenteditable=true]", this._onChangeInput.bind(this));

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    // Increment item quantity
    html.find(".item-quantity-plus").click((ev) => {
      ev.preventDefault();
      let item = this.actor.items.get(ev.currentTarget.dataset.itemid);    
      console.log(item);
      event.preventDefault();
      item.update({ "system.quantity":  item.system.quantity += 1 });
    });

    // Decrease item quantity
    html.find(".item-quantity-minus").click((ev) => {
      ev.preventDefault();
      let item = this.actor.items.get(ev.currentTarget.dataset.itemid);    
      console.log(item);
      event.preventDefault();
      item.update({ "system.quantity":  item.system.quantity -= 1 });
    });

    // Rollable abilities.
    html.find(".rollable-check").click((ev) => {
      ev.preventDefault();
      let habilidad = ev.currentTarget.dataset.habilidad;
      let habilidadValor = getProperty(
        this.actor.system,
        `habilidades.${habilidad}.value`
      );
      let habilidadNombre = getProperty(
        this.actor.system,
        `habilidades.${habilidad}.label`
      );
      var value = $(ev.currentTarget).attr('contenteditable');
      if (value !== 'true') {_onCheckRoll(this.actor,habilidadValor,habilidadNombre);}
    });

    html.find(".rollable-init").click((ev) => {
      ev.preventDefault();
      _onInitRoll(this.actor);
    });

    html.find(".rollable-attack").click((ev) => {
      ev.preventDefault();
      let weapon = this.actor.items.get(ev.currentTarget.dataset.itemid).system;    
      _onAttackRoll(this.actor,weapon);
    });

    html.find(".rollable-status").click((ev) => {
      ev.preventDefault();
      let status = ev.currentTarget.dataset.status;  
      _onStatusRoll(this.actor,status);
    });

    //html.find('.stat-row').hover(ev => {$(ev.currentTarget).children('.spent-concept').toggleClass('hide');   })

    html.find(".habilidad-edit").click((ev) => {
      let element = $(ev.currentTarget).next(".label-body");
      let value = element.attr('contenteditable');

      if (value == 'false') {
        element.attr('contenteditable','true').removeClass('rollable-check');
      }
      else {
        element.attr('contenteditable','false').addClass('rollable-check');
      }
    }); 

    html.find(".hito-disable").contextmenu((ev) => {
      $(ev.currentTarget).toggleClass("input-header-disabled");
    });    


    html.find(".item-toggle").click(ev => {
      ev.preventDefault();
      let armor = this.actor.items.get(ev.currentTarget.dataset.itemid);
      armor.update({data: {equipped: !armor.system.equipped}});
      //armor.equipped = (armor.equipped === false ? true : false);
      this.actor._calculateRD(this.actor)
    })

  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
   async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    console.log(header.dataset)
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemsystem["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /* -------------------------------------------- */
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
   async _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const armor = [];
    const weapon = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.system;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to armor.
      else if (i.type === 'armor') {
        armor.push(i);
      }
      // Append to weapons.
      else if (i.type === 'weapon') {
        weapon.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.armor = armor;
    actorData.weapon = weapon;
  }
}