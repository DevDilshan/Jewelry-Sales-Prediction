import { useEffect, useState, useRef } from 'react'
import './Products.css'
import axios from "axios"
import { API_BASE, getStaffToken } from '../../config/api'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function staffAuthHeaders() {
  const t = getStaffToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export default function Products({ setActivePage }) {
  useEffect(() => {
    setActivePage('products')
  }, [setActivePage])

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [actionMenu, setActionMenu] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editData, setEditData] = useState({})
  const menuRef = useRef(null)

  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get(`${API_BASE}/product`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err))
  }, [])

  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: '', metal: '', gem: '',
    reorderLevel: '', stockCount: '', price: '', description: '', active: false
  })
  const [mainImage, setMainImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([null, null, null, null])

  // Close action menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setActionMenu(null)
    }
    if (actionMenu !== null) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [actionMenu])

  // ✅ Fixed: uses correct API field names
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.productCategory === categoryFilter
    let matchesStock = true
    if (stockFilter === 'In Stock') matchesStock = product.stockQuantity > 0
    if (stockFilter === 'Out Of Stock') matchesStock = product.stockQuantity === 0
    return matchesSearch && matchesCategory && matchesStock
  })

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setMainImage(dataUrl)
    } catch (err) {
      console.error('Could not read image:', err)
    }
    e.target.value = ''
  }

  const handleAdditionalImageUpload = async (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const updated = [...additionalImages]
      updated[index] = dataUrl
      setAdditionalImages(updated)
    } catch (err) {
      console.error('Could not read image:', err)
    }
    e.target.value = ''
  }

  const handleEditMainImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setEditData((prev) => ({ ...prev, productImage: dataUrl }))
    } catch (err) {
      console.error('Could not read image:', err)
    }
    e.target.value = ''
  }

  // ✅ Fixed: uses correct field names for stock status
  const getStockStatus = (count, reorderLevel) => {
    if (count === 0) return 'out-of-stock'
    if (count <= reorderLevel) return 'low-stock'
    return 'in-stock'
  }

  // ✅ Fixed: uses _id and isActive
  const toggleActive = (id) => {
    setProducts(products.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p))
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const prod = {
        productName: newProduct.name,
        productDescription: newProduct.description || '',
        productCategory: newProduct.category || 'Rings',
        productPrice: parseFloat(newProduct.price) || 0,
        metalMaterial: newProduct.metal?.toLowerCase() || 'gold',
        gemType: newProduct.gem?.toLowerCase() || 'none',
        stockQuantity: parseInt(newProduct.stockCount) || 0,
        reorderLevel: parseInt(newProduct.reorderLevel) || 5,
        isActive: newProduct.active
      }
      if (mainImage && String(mainImage).startsWith('data:')) {
        prod.productImage = mainImage
      }

      const res = await axios.post(`${API_BASE}/product/create`, prod, { headers: staffAuthHeaders() })

      // ✅ Fixed: use res.data so the saved doc has _id and timestamps
      setProducts([res.data, ...products])

      setNewProduct({
        name: '', sku: '', category: '', metal: '', gem: '',
        reorderLevel: '', stockCount: '', price: '', description: '', active: false
      })
      setMainImage(null)
      setAdditionalImages([null, null, null, null])
      setShowModal(false)
    } catch (error) {
      console.error('Error saving product:', error.response?.data || error.message)
    }
  }

  const openEdit = (product) => {
    setSelectedProduct(product)
    setEditData({ ...product })
    setActionMenu(null)
    setEditModal(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const updatedProduct = {
        productName: editData.productName,
        productDescription: editData.productDescription || '',
        productCategory: editData.productCategory || 'Rings',
        productPrice: parseFloat(editData.productPrice) || 0,
        metalMaterial: editData.metalMaterial?.toLowerCase() || 'gold',
        gemType: editData.gemType?.toLowerCase() || 'none',
        stockQuantity: parseInt(editData.stockQuantity) || 0,
        productImage: editData.productImage || selectedProduct.productImage,
        reorderLevel: parseInt(editData.reorderLevel) || 5,
        isActive: editData.isActive
      }

      const res = await axios.put(`${API_BASE}/product/${selectedProduct._id}`, updatedProduct, {
        headers: staffAuthHeaders(),
      })
      console.log(res.data)

      // ✅ Fixed: uses _id to match, spreads updatedProduct fields
      setProducts(products.map(p => p._id === selectedProduct._id ? { ...p, ...updatedProduct } : p))
      setEditModal(false)
      setSelectedProduct(null)
    } catch (error) {
      console.log("Error updating the product", error)
    }
  }

  const openDelete = (product) => {
    setSelectedProduct(product)
    setActionMenu(null)
    setDeleteConfirm(true)
  }

  // ✅ Fixed: uses _id
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/product/${selectedProduct._id}`, { headers: staffAuthHeaders() })
      setProducts(products.filter(p => p._id !== selectedProduct._id))
    } catch (error) {
      console.error('Error deleting product:', error.response?.data || error.message)
    }
    setDeleteConfirm(false)
    setSelectedProduct(null)
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Product Management</h1>
          <p>Manage your luxury jewelry collection and inventory.</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add New Product</button>
      </div>

      <div className="products-controls">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search by product name..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">Category: All</option>
          <option value="Rings">Rings</option>
          <option value="Necklace">Necklace</option>
          <option value="Earring">Earring</option>
          <option value="Bracelet">Bracelet</option>
          <option value="Watch">Watch</option>
        </select>
        <select className="filter-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="All">Stock Status: All</option>
          <option value="In Stock">In Stock</option>
          <option value="Out Of Stock">Out Of Stock</option>
        </select>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>PRODUCT NAME</th>
              <th>CATEGORY</th>
              <th>METAL</th>
              <th>GEM</th>
              <th>PRICE (LKR)</th>
              <th>REORDER LEVEL</th>
              <th>STOCK QUANTITY</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ Fixed: filteredProducts + correct field names throughout */}
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stockQuantity, product.reorderLevel)
              return (
                <tr key={product._id}>
                  <td>
                    <div className="product-image">
                      {product.productImage
                        ? <img src={product.productImage} alt={product.productName} />
                        : <div className="product-image-placeholder" />}
                    </div>
                  </td>
                  <td>
                    <div className="product-info">
                      <p className="product-name">{product.productName}</p>
                    </div>
                  </td>
                  <td><span className="category-tag">{product.productCategory}</span></td>
                  <td className="cell-text">{product.metalMaterial}</td>
                  <td className="cell-text">{product.gemType}</td>
                  <td className="price">{product.productPrice?.toLocaleString()}</td>
                  <td className="cell-text">{product.reorderLevel}</td>
                  <td>
                    <div className={`stock-badge ${stockStatus}`}>
                      <span className="stock-dot">●</span> {product.stockQuantity} in stock
                    </div>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={product.isActive} onChange={() => toggleActive(product._id)} />
                      <span className={`toggle-slider ${product.isActive ? 'active' : 'inactive'}`}></span>
                    </label>
                  </td>
                  <td>
                    <div className="action-wrapper" ref={actionMenu === product._id ? menuRef : null}>
                      <button className="action-icon" onClick={() => setActionMenu(actionMenu === product._id ? null : product._id)}>⋮</button>
                      {actionMenu === product._id && (
                        <div className="action-dropdown">
                          <button className="action-dropdown-item" onClick={() => openEdit(product)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Edit
                          </button>
                          <button className="action-dropdown-item danger" onClick={() => openDelete(product)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>SHOWING 1 TO {filteredProducts.length} OF {products.length} PRODUCTS</span>
        <div className="pagination-buttons">
          <button className="page-btn">‹</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">›</button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="modal-body">
                <div className="modal-left">
                  <p className="section-label">PRODUCT MAIN IMAGE</p>
                  <label className="main-image-upload">
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} style={{ display: 'none' }} />
                    {mainImage ? <img src={mainImage} alt="Main" className="uploaded-main-img" /> : (
                      <div className="main-image-placeholder">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aab" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                        <span>Upload High-Res Image</span>
                      </div>
                    )}
                  </label>
                  <div className="additional-images">
                    {additionalImages.map((img, i) => (
                      <label key={i} className="additional-image-slot">
                        <input type="file" accept="image/*" onChange={(e) => handleAdditionalImageUpload(i, e)} style={{ display: 'none' }} />
                        {img ? <img src={img} alt={`Additional ${i + 1}`} className="uploaded-add-img" /> : <span className="add-img-plus">+</span>}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="modal-right">
                  <div className="form-group">
                    <label>PRODUCT NAME</label>
                    <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Diamond Eternity Band" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>CATEGORY</label>
                      <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                        <option value="" disabled>Select Category</option>
                        <option value="Rings">Rings</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Earring">Earring</option>
                        <option value="Bracelet">Bracelet</option>
                        <option value="Watch">Watch</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>STOCK QUANTITY</label>
                      <input type="number" min="0" value={newProduct.stockCount} onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>METAL MATERIAL</label>
                      <select value={newProduct.metal} onChange={(e) => setNewProduct({ ...newProduct, metal: e.target.value })}>
                        <option value="" disabled>Select Metal</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Rose Gold">Rose Gold</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>GEM TYPE</label>
                      <select value={newProduct.gem} onChange={(e) => setNewProduct({ ...newProduct, gem: e.target.value })}>
                        <option value="" disabled>Select Gem</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Emerald">Emerald</option>
                        <option value="Ruby">Ruby</option>
                        <option value="Sapphire">Sapphire</option>
                        <option value="Pearl">Pearl</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>PRICE (LKR)</label>
                    <div className="price-input-wrap">
                      <span className="price-prefix">Rs.</span>
                      <input type="text" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" className="price-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>DESCRIPTION</label>
                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Describe the craftsmanship and materials..." rows={3} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>REORDER LEVEL</label>
                      <input type="number" min="0" value={newProduct.reorderLevel} onChange={(e) => setNewProduct({ ...newProduct, reorderLevel: e.target.value })} placeholder="0" />
                    </div>
                    <div className="form-group active-status-group">
                      <label>ACTIVE STATUS</label>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={newProduct.active} onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })} />
                        <span className={`toggle-slider ${newProduct.active ? 'active' : 'inactive'}`}></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="modal-left">
                  <p className="section-label">PRODUCT MAIN IMAGE</p>
                  <label className="main-image-upload">
                    <input type="file" accept="image/*" onChange={handleEditMainImageUpload} style={{ display: 'none' }} />
                    {editData.productImage ? <img src={editData.productImage} alt="Main" className="uploaded-main-img" /> : (
                      <div className="main-image-placeholder">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aab" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                        <span>Click to upload / replace</span>
                      </div>
                    )}
                  </label>
                  {editData.productImage && (
                    <p className="section-label" style={{ marginTop: 8, fontWeight: 500 }}>Click image to replace</p>
                  )}
                </div>
                <div className="modal-right">
                  <div className="form-group">
                    <label>PRODUCT NAME</label>
                    <input type="text" required value={editData.productName || ''} onChange={(e) => setEditData({ ...editData, productName: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>CATEGORY</label>
                      <select value={editData.productCategory || ''} onChange={(e) => setEditData({ ...editData, productCategory: e.target.value })}>
                        <option value="Rings">Rings</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Earring">Earring</option>
                        <option value="Bracelet">Bracelet</option>
                        <option value="Watch">Watch</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>STOCK QUANTITY</label>
                      <input type="number" min="0" value={editData.stockQuantity || 0} onChange={(e) => setEditData({ ...editData, stockQuantity: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>METAL MATERIAL</label>
                      <select value={editData.metalMaterial || ''} onChange={(e) => setEditData({ ...editData, metalMaterial: e.target.value })}>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                        <option value="rose gold">Rose Gold</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>GEM TYPE</label>
                      <select value={editData.gemType || ''} onChange={(e) => setEditData({ ...editData, gemType: e.target.value })}>
                        <option value="diamond">Diamond</option>
                        <option value="emerald">Emerald</option>
                        <option value="ruby">Ruby</option>
                        <option value="sapphire">Sapphire</option>
                        <option value="pearl">Pearl</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>PRICE (LKR)</label>
                    <div className="price-input-wrap">
                      <span className="price-prefix">Rs.</span>
                      <input type="text" required value={editData.productPrice || ''} onChange={(e) => setEditData({ ...editData, productPrice: e.target.value })} className="price-input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>DESCRIPTION</label>
                    <textarea value={editData.productDescription || ''} onChange={(e) => setEditData({ ...editData, productDescription: e.target.value })} rows={3} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>REORDER LEVEL</label>
                      <input type="number" min="0" value={editData.reorderLevel || 0} onChange={(e) => setEditData({ ...editData, reorderLevel: e.target.value })} />
                    </div>
                    <div className="form-group active-status-group">
                      <label>ACTIVE STATUS</label>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={editData.isActive || false} onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })} />
                        <span className={`toggle-slider ${editData.isActive ? 'active' : 'inactive'}`}></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && selectedProduct && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Product</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(false)}>✕</button>
            </div>
            <div className="confirm-body">
              <div className="confirm-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <p>Are you sure you want to delete <strong>{selectedProduct.productName}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button type="button" className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}