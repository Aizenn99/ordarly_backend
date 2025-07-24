const ItemCart = require("../../models/ItemCart");
const MenuItem = require("../../models/menuitem"); // Assumes you have a MenuItem model

// 1. Add or update item in the cart
exports.addOrUpdateItemToCart = async (req, res) => {
  try {
    const { tableName, guestCount, itemId, quantity } = req.body;
    console.log("Adding/updating item in cart:", {
      tableName,
      
    });
 
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    let cart = await ItemCart.findOne({ tableName });

    if (!cart) {
      // New cart for table
      cart = new ItemCart({
        tableName,
        guestCount,
        items: [{ itemId, quantity, price: menuItem.price }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.itemId.toString() === itemId
      );
      if (existingItem) {
        existingItem.quantity = quantity;
        existingItem.price = menuItem.price;
      } else {
        cart.items.push({ itemId, quantity, price: menuItem.price });
      }
      cart.guestCount = guestCount; // update guest count if needed
    }

    await cart.save();
    return res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get cart for a table
exports.getCartByTable = async (req, res) => {
  try {
    const { tableName } = req.params;

    const cart = await ItemCart.findOne({ tableName }).populate("items.itemId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json(cart);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


// 3. Remove an item from the cart
exports.removeItemFromCart = async (req, res) => {
  try {
    const { tableName, itemId } = req.body;


    const cart = await ItemCart.findOne({ tableName });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.itemId.toString() !== itemId);

    await cart.save();
    return res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Clear cart for a table (after bill is generated)
exports.clearCartByTable = async (req, res) => {
  try {
    const { tableName } = req.params;

    const result = await ItemCart.deleteOne({ tableName });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
