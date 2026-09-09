/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   ProductService.js (Domain Service for Product Catalog Management)
 */

import { productRepository } from "../../repositories/productRepository.js";

export class ProductService {
  static instance = null;

  constructor(repo = productRepository) {
    if (ProductService.instance && repo === productRepository) {
      return ProductService.instance;
    }
    this.repo = repo;
    if (repo === productRepository) {
      ProductService.instance = this;
    }
  }

  static getInstance(repo = productRepository) {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService(repo);
    }
    return ProductService.instance;
  }

  /**
   * Fetch all products with role-based filtering & pagination
   */
  async getAllProducts(userRole, { status, search, page = 1, limit = 50, sortBy = "name", sortOrder = "ASC" } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Riders should default to AVAILABLE products only
    let effectiveStatus = status;
    if (userRole === "RIDER") {
      effectiveStatus = "AVAILABLE";
    }

    const [products, total] = await Promise.all([
      this.repo.findAll({
        status: effectiveStatus,
        search,
        limit: limitNum,
        offset,
        sortBy,
        sortOrder,
      }),
      this.repo.countAll({
        status: effectiveStatus,
        search,
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Fetch single product by ID
   */
  async getProductById(id) {
    if (!id) {
      const error = new Error("Product ID harus diisi.");
      error.statusCode = 400;
      throw error;
    }

    const product = await this.repo.findById(id);
    if (!product) {
      const error = new Error(`Produk dengan ID '${id}' tidak ditemukan.`);
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  /**
   * Create a new product in master catalog
   */
  async createProduct({ name, description = "", price, status = "AVAILABLE" }) {
    if (!name || typeof name !== "string" || !name.trim()) {
      const error = new Error("Nama produk wajib diisi.");
      error.statusCode = 400;
      throw error;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      const error = new Error("Harga produk harus berupa angka positif lebih dari 0.");
      error.statusCode = 400;
      throw error;
    }

    const validStatuses = ["AVAILABLE", "DISCONTINUED"];
    const productStatus = status ? status.toUpperCase() : "AVAILABLE";
    if (!validStatuses.includes(productStatus)) {
      const error = new Error(`Status produk tidak valid. Harus salah satu dari: ${validStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate name
    const existing = await this.repo.findByName(name);
    if (existing) {
      const error = new Error(`Produk dengan nama '${name.trim()}' sudah terdaftar.`);
      error.statusCode = 400;
      throw error;
    }

    const newProduct = await this.repo.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      price: numericPrice,
      status: productStatus,
    });

    return newProduct;
  }

  /**
   * Update existing product details
   */
  async updateProduct(id, { name, description, price, status }) {
    const existing = await this.getProductById(id);

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        const error = new Error("Nama produk tidak boleh kosong.");
        error.statusCode = 400;
        throw error;
      }
      const duplicate = await this.repo.findByName(name, id);
      if (duplicate) {
        const error = new Error(`Produk dengan nama '${name.trim()}' sudah terdaftar.`);
        error.statusCode = 400;
        throw error;
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : "";
    }

    if (price !== undefined) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        const error = new Error("Harga produk harus berupa angka positif lebih dari 0.");
        error.statusCode = 400;
        throw error;
      }
      updates.price = numericPrice;
    }

    if (status !== undefined) {
      const validStatuses = ["AVAILABLE", "DISCONTINUED"];
      const upperStatus = status.toUpperCase();
      if (!validStatuses.includes(upperStatus)) {
        const error = new Error(`Status produk tidak valid. Harus salah satu dari: ${validStatuses.join(", ")}`);
        error.statusCode = 400;
        throw error;
      }
      updates.status = upperStatus;
    }

    const updated = await this.repo.update(id, updates);
    return updated;
  }

  /**
   * Quick status toggle (AVAILABLE / DISCONTINUED)
   */
  async updateProductStatus(id, status) {
    await this.getProductById(id);

    const validStatuses = ["AVAILABLE", "DISCONTINUED"];
    const upperStatus = status ? status.toUpperCase() : "";
    if (!validStatuses.includes(upperStatus)) {
      const error = new Error(`Status produk tidak valid. Harus salah satu dari: ${validStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await this.repo.updateStatus(id, upperStatus);
    return updated;
  }

  /**
   * Delete product with historical sales guard
   */
  async deleteProduct(id) {
    const existing = await this.getProductById(id);

    // Historical sales guard
    const hasHistory = await this.repo.hasSalesHistory(id);
    if (hasHistory) {
      const error = new Error(
        `Produk '${existing.name}' tidak dapat dihapus karena telah memiliki histori transaksi penjualan. Harap gunakan fitur Nonaktifkan (status: DISCONTINUED) untuk menjaga integritas data akuntansi.`
      );
      error.statusCode = 400;
      throw error;
    }

    const deleted = await this.repo.delete(id);
    return deleted;
  }
}

export const productService = ProductService.getInstance();
