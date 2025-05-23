const Product = require("../models/product");
const { validationResult } = require("express-validator");
const path = require("path");
const streamifier = require("streamifier");
const UserModel = require("../models/user");

const cloudinary = require("../util/cloudinary").cloudinary; // assuming you export configured cloudinary instance here

// Helper: Upload image to Cloudinary via stream
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Delete image from Cloudinary by public_id
const deleteCloudinaryImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
    throw err;
  }
};

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: [],
    validationErrors: [],
  });
};

exports.getWallets = async (req, res, next) => {
  if (!req.user || !req.session.user) {
    return next();
  }

  const user = req.user ?? (await UserModel.findById(req.session.user._id)) ?? null;
  const balance = user?.point;

  if (user) {
    return res.render("admin/wallet", {
      user,
      balance,
    });
  }

  res.redirect("/login");
};

exports.loadBalance = async (req, res) => {
  // Implementation needed here
};

exports.withdrawBalance = async (req, res) => {
  // Implementation needed here
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { title, price, description } = req.body;
    const image = req.file;

    // Validate image upload
    if (!image) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: true,
        product: { title, price, description },
        errorMessage: "Attached file is not an image.",
        validationErrors: [],
      });
    }

    // Validate other inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: true,
        product: { title, price, description },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await streamUpload(image.buffer);

    // Create product document
    const product = new Product({
      title,
      price,
      description,
      imageUrl: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
      userId: req.user._id,
    });

    await product.save();

    console.log("Created Product");
    res.redirect("/admin/products");
  } catch (err) {
    console.error("postAddProduct error:", err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
        hasError: false,
        errorMessage: [],
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasError: true,
        product: {
          title: updatedTitle,
          price: updatedPrice,
          description: updatedDesc,
          _id: prodId,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    const product = await Product.findById(prodId);

    if (!product) {
      return res.redirect("/");
    }

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    if (image) {
      // Upload new image to Cloudinary
      const uploadedImage = await streamUpload(image.buffer);

      // Delete old image from Cloudinary
      try {
        await deleteCloudinaryImage(product.publicId);
        console.log("Old image deleted");
      } catch (err) {
        console.error("Failed to delete old image", err);
      }

      product.imageUrl = uploadedImage.secure_url;
      product.publicId = uploadedImage.public_id;
    }

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;

    await product.save();

    console.log("UPDATED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    console.error("postEditProduct error:", err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Delete image from Cloudinary
    await deleteCloudinaryImage(product.publicId);

    // Delete product document
    await Product.deleteOne({ _id: prodId, userId: req.user._id });

    console.log("DESTROYED PRODUCT");
    res.status(200).json({ message: "Success!" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ message: "Deleting product failed!" });
  }
};
