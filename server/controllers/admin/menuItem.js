const menuitem = require("../../models/menuitem");
const MenuCategory = require("../../models/MenuCategory");
const SubCat = require("../../models/SubCat");

const addMenu = async (req, res) => {
  try {
    const { imageURL, title, description, category, subcategory, price } =
      req.body;

    const menuItem = new menuitem({
      imageURL,
      title,
      description,
      category,
      subcategory,
      price,
    });
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: "Menu item added successfully!",
      menuItem,
    });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ success: false, message: "Error adding menu item" });
  }
};

const fetchAllMenuItems = async (req, res) => {
  try {
    const listOfMenuItems = await menuitem.find();
    res.status(200).json({
      success: true,
      message: "Menu items fetched successfully!",
      listOfMenuItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching menu items" });
  }
};

const EditMenuItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { imageURL, title, description, category, subcategory, price } =
      req.body;

    let findMenuItem = await menuitem.findById(id);
    findMenuItem.imageURL = imageURL || findMenuItem.imageURL;
    findMenuItem.title = title || findMenuItem.title;
    findMenuItem.description = description || findMenuItem.description;
    findMenuItem.category = category || findMenuItem.category;
    findMenuItem.subcategory = subcategory || findMenuItem.subcategory;
    findMenuItem.price = price === "" ? 0 : price || findMenuItem.price;

    await findMenuItem.save();
    res.status(200).json({
      success: true,
      message: "Menu item edited successfully!",
      findMenuItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error editing menu item" });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const id = req.params.id;
    const menuItem = await menuitem.findByIdAndDelete(id);
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Menu item deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting menu item" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    const newCategory = new MenuCategory({
      name,
      icon,
    });

    await newCategory.save();

    res.status(200).json({
      success: true,
      message: "Category added successfully!",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: "Error adding category" });
  }
};

const fetchAllCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find();
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      categories,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await MenuCategory.findByIdAndDelete(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting category" });
  }
};

const addSubCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const newSubCategory = new SubCat({
      name,
    });

    await newSubCategory.save();

    res.status(200).json({
      success: true,
      message: "Subcategory added successfully!",
      subcategory: newSubCategory,
    });
  } catch (error) {
    console.error("Error adding subcategory:", error);
    res
      .status(500)
      .json({ success: false, message: "Error adding subcategory" });
  }
};

const fetchAllSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCat.find();
    res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully!",
      subcategories,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching subcategories" });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const subcategory = await SubCat.findByIdAndDelete(id);
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Subcategory deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting subcategory" });
  }
};

module.exports = {
  addMenu,
  fetchAllMenuItems,
  EditMenuItem,
  deleteMenuItem,
  addCategory,
  fetchAllCategories,
  deleteCategory,
  addSubCategory,
  fetchAllSubCategories,
  deleteSubCategory,
};
