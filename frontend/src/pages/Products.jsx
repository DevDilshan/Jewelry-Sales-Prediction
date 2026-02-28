import { useEffect, useState } from 'react'
import './Products.css'

export default function Products({ setActivePage }) {
  useEffect(() => {
    setActivePage('products')
  }, [setActivePage])

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Solitaire Diamond Ring',
      sku: 'AUR-RI-001',
      category: 'Rings',
      metal: 'Gold',
      gem: 'Diamond',
      reorderLevel: 5,
      stockCount: 12,
      price: '125,000',
      image: null,
      active: true,
    },
    {
      id: 2,
      name: 'Heritage Gold Necklace',
      sku: 'AUR-NE-042',
      category: 'Necklace',
      metal: 'Gold',
      gem: 'Emerald',
      reorderLevel: 3,
      stockCount: 5,
      price: '225,000',
      image: null,
      active: true,
    },
    {
      id: 3,
      name: 'Ocean Peral Earrings',
      sku: 'AUR-EA-105',
      category: 'Earring',
      metal: 'Silver',
      gem: 'Diamond',
      reorderLevel: 5,
      stockCount: 0,
      price: '100,000',
      image: null,
      active: false,
    },
  ])

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    metal: '',
    gem: '',
    reorderLevel: '',
    stockCount: '',
    price: '',
    description: '',
    active: false,
  })
  const [mainImage, setMainImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([null, null, null, null])

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) setMainImage(URL.createObjectURL(file))
  }

  const handleAdditionalImageUpload = (index, e) => {
    const file = e.target.files[0]
    if (file) {
      const updated = [...additionalImages]
      updated[index] = URL.createObjectURL(file)
      setAdditionalImages(updated)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    let matchesStock = true
    if (stockFilter === 'In Stock') matchesStock = product.stockCount > 0
    if (stockFilter === 'Out Of Stock') matchesStock = product.stockCount === 0
    return matchesSearch && matchesCategory && matchesStock
  })

  const getStockStatus = (count, reorderLevel) => {
    if (count === 0) return 'out-of-stock'
    if (count <= reorderLevel) return 'low-stock'
    return 'in-stock'
  }

  const toggleActive = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const handleAddProduct = (e) => {
    e.preventDefault()
    const count = parseInt(newProduct.stockCount) || 0
    const prod = {
      id: products.length + 1,
      name: newProduct.name,
      sku: newProduct.sku || `AUR-XX-${String(products.length + 1).padStart(3, '0')}`,
      category: newProduct.category || 'Rings',
      metal: newProduct.metal || 'Gold',
      gem: newProduct.gem || 'None',
      reorderLevel: parseInt(newProduct.reorderLevel) || 5,
      stockCount: count,
      price: newProduct.price,
      image: mainImage,
      active: newProduct.active,
    }
    setProducts([prod, ...products])
    setNewProduct({ name: '', sku: '', category: '', metal: '', gem: '', reorderLevel: 0, stockCount: 0, price: '', description: '', active: false })
    setMainImage(null)
    setAdditionalImages([null, null, null, null])
    setShowModal(false)
  }

  const categoryColors = {
    'Rings': '#b8860b',
    'Necklace': '#b8860b',
    'Earring': '#b8860b',
    'Bracelet': '#b8860b',
    'Watch': '#b8860b',
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
          <input
            type="text"
            placeholder="Search by product name..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">Category: All</option>
          <option value="Rings">Rings</option>
          <option value="Necklace">Necklace</option>
          <option value="Earring">Earring</option>
          <option value="Bracelet">Bracelet</option>
          <option value="Watch">Watch</option>
        </select>

        <select
          className="filter-select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
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
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stockCount, product.reorderLevel)
              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-image">
                      {product.image
                        ? <img src={product.image} alt={product.name} />
                        : <div className="product-image-placeholder" />
                      }
                    </div>
                  </td>
                  <td>
                    <div className="product-info">
                      <p className="product-name">{product.name}</p>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{product.category}</span>
                  </td>
                  <td className="cell-text">{product.metal}</td>
                  <td className="cell-text">{product.gem}</td>
                  <td className="price">{product.price}</td>
                  <td className="cell-text">{product.reorderLevel}</td>
                  <td>
                    <div className={`stock-badge ${stockStatus}`}>
                      <span className="stock-dot">●</span> {product.stockCount} in stock
                    </div>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={product.active}
                        onChange={() => toggleActive(product.id)}
                      />
                      <span className={`toggle-slider ${product.active ? 'active' : 'inactive'}`}></span>
                    </label>
                  </td>
                  <td>
                    <button className="action-icon">⋮</button>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="modal-body">
                {/* Left: Image Upload */}
                <div className="modal-left">
                  <p className="section-label">PRODUCT MAIN IMAGE</p>
                  <label className="main-image-upload">
                    <input type="file" accept="image/*" onChange={handleMainImageUpload} style={{ display: 'none' }} />
                    {mainImage
                      ? <img src={mainImage} alt="Main" className="uploaded-main-img" />
                      : (
                        <div className="main-image-placeholder">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aab" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                          <span>Upload High-Res Image</span>
                        </div>
                      )
                    }
                  </label>
                  <div className="additional-images">
                    {additionalImages.map((img, i) => (
                      <label key={i} className="additional-image-slot">
                        <input type="file" accept="image/*" onChange={(e) => handleAdditionalImageUpload(i, e)} style={{ display: 'none' }} />
                        {img
                          ? <img src={img} alt={`Additional ${i + 1}`} className="uploaded-add-img" />
                          : <span className="add-img-plus">+</span>
                        }
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right: Form Fields */}
                <div className="modal-right">
                  <div className="form-group">
                    <label>PRODUCT NAME</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. Diamond Eternity Band"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>CATEGORY</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
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
                      <input
                        type="number"
                        min="0"
                        value={newProduct.stockCount}
                        onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>METAL MATERIAL</label>
                      <select
                        value={newProduct.metal}
                        onChange={(e) => setNewProduct({ ...newProduct, metal: e.target.value })}
                      >
                        <option value="" disabled>Select Metal</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Rose Gold">Rose Gold</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>GEM TYPE</label>
                      <select
                        value={newProduct.gem}
                        onChange={(e) => setNewProduct({ ...newProduct, gem: e.target.value })}
                      >
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
                      <input
                        type="text"
                        required
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="0.00"
                        className="price-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>DESCRIPTION</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Describe the craftsmanship and materials..."
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>REORDER LEVEL</label>
                      <input
                        type="number"
                        min="0"
                        value={newProduct.reorderLevel}
                        onChange={(e) => setNewProduct({ ...newProduct, reorderLevel: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="form-group active-status-group">
                      <label>ACTIVE STATUS</label>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={newProduct.active}
                          onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })}
                        />
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
    </div>
  )
}