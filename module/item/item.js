/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class HitosItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // Get the Item's data
    const itemData = this;

    let img = CONST.DEFAULT_TOKEN;
    switch (itemData.type) {
      case "item":
        img = "/systems/hitos/assets/icons/item.svg";
        break;
      case "armor":
        img = "/systems/hitos/assets/icons/armor.svg";
        break;
      case "weapon":
        img = "/systems/hitos/assets/icons/weapon.svg";
        break;
    }
    if (itemData.img === "icons/svg/item-bag.svg") itemData.img = img;  

    super.prepareData();
  }
}
