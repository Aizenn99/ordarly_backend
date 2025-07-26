const express = require("express");
const router = express.Router();
const {
  addMenu,
  fetchAllMenuItems,
  EditMenuItem,
  deleteMenuItem,
  addCategory,
  addSubCategory,
  fetchAllCategories,
  fetchAllSubCategories,
  deleteCategory,
  deleteSubCategory,
} = require("../../controllers/admin/menuItem");
const {
  addtable,
  addSpaces,
  fetchAllTables,
  editTable,
  deleteTable,
  fetchSpaces,
  changeTableStatus,
} = require("../../controllers/admin/tables");
const upload = require("../../controllers/admin/uploadMiddleWare");

router.post("/add-menu", addMenu);
router.get("/fetch-menu", fetchAllMenuItems);
router.put("/update-menu/:id", EditMenuItem);
router.delete("/delete-menu/:id", deleteMenuItem);

//category routes
router.post("/add-category", addCategory);
router.get("/fetch-categories", fetchAllCategories);
router.delete("/delete-category/:id", deleteCategory);

//subcategory routes
router.post("/add-subcategory", addSubCategory);
router.get("/fetch-subcategories", fetchAllSubCategories);
router.delete("/delete-subcategory/:id", deleteSubCategory);


// Image upload route
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // ✅ Properly get and clean IPv4 address
  const rawIp = req.socket.localAddress;
  const cleanedIp = rawIp.replace("::ffff:", "") === "::1" ? "localhost" : rawIp.replace("::ffff:", "");

const imageUrl = `/uploads/${req.file.filename}`; // ✅ just the relative path

  console.log("🖼️ Image URL:", imageUrl);

  res.status(200).json({ message: "File uploaded successfully", imageUrl });
});

//table routes for admin section
router.post("/add-table", addtable);
router.get("/fetch-tables", fetchAllTables);
router.put("/update-table/:id", editTable);
router.put("/change-table-status/:id", changeTableStatus);
router.delete("/delete-table/:id", deleteTable);

//spaces routes
router.post("/add-spaces", addSpaces);
router.get("/fetch-spaces", fetchSpaces);

module.exports = router;
