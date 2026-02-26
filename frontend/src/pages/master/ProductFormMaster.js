import React, { useState } from "react";
import API from "../../../services/api";

function ProductForm() {
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("products/", form);
      alert("✅ Product added successfully!");
      setForm({ name: "", description: "", price: "" });
    } catch (err) {
      console.error(err);
      alert("❌ Error adding product!");
    }
  };

  return (
    <div className="form-box">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="Price" required />
        <button type="submit">Save Product</button>
      </form>
    </div>
  );
}

export default ProductForm;