/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   productController.js (HTTP Controller for Product Catalog CRUD)
 */

import { productService } from "../services/product/ProductService.js";

export const getProducts = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const { status, search, page, limit, sort_by, sort_order } = req.query;

    const result = await productService.getAllProducts(userRole, {
      status,
      search,
      page,
      limit,
      sortBy: sort_by,
      sortOrder: sort_order,
    });

    return res.status(200).json({
      status: "success",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    return res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, status } = req.body;
    const newProduct = await productService.createProduct({
      name,
      description,
      price,
      status,
    });

    return res.status(201).json({
      status: "success",
      msg: `Produk '${newProduct.name}' berhasil ditambahkan ke katalog menu.`,
      data: newProduct,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, status } = req.body;

    const updated = await productService.updateProduct(id, {
      name,
      description,
      price,
      status,
    });

    return res.status(200).json({
      status: "success",
      msg: `Data produk '${updated.name}' berhasil diperbarui.`,
      data: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await productService.updateProductStatus(id, status);

    return res.status(200).json({
      status: "success",
      msg: `Status produk '${updated.name}' berhasil diubah menjadi '${updated.status}'.`,
      data: updated,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await productService.deleteProduct(id);

    return res.status(200).json({
      status: "success",
      msg: `Produk '${deleted.name}' berhasil dihapus secara permanen dari katalog menu.`,
      data: deleted,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ msg: error.message || "Internal server error" });
  }
};
