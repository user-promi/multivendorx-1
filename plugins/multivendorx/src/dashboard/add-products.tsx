import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { BasicInput, CommonPopup, FileInput, SelectInput, TextArea, ToggleSetting } from "zyra";

const AddProduct = () => {
   const location = useLocation();

   const query = new URLSearchParams(location.search);
   const productId = query.get("context_id");
   const [product, setProduct] = useState({});
   const [shippingClasses, setShippingClasses] = useState([]);

   useEffect(() => {
      if (!productId) return;

      axios.get(`${appLocalizer.apiUrl}/wc/v3/products/${productId}`, {
         headers: { "X-WP-Nonce": appLocalizer.nonce }
      })
         .then(function (res) {
            setProduct(res.data);
         })

   }, [productId]);


   const [variants, setVariants] = useState([
      {
         id: 1,
         name: "Color",
         values: ["Red", "Green", "Blue", "Red", "Green", "Blue", "Red", "Green", "Blue", "Red", "Green", "Blue"],
         tempValue: "",
         isEditing: false,
      },
      {
         id: 2,
         name: "Size",
         values: ["S", "M", "L", "XL"],
         tempValue: "",
         isEditing: false,
      },
      {
         id: 3,
         name: "Material",
         values: ["Cotton", "Silk"],
         tempValue: "",
         isEditing: false,
      }
   ]);
   const [AddAttribute, setAddAttribute] = useState(false);

   const wrapperRef = useRef(null);

   useEffect(() => {
      function handleClick(e) {
         if (!wrapperRef.current) return;

         variants.forEach(v => {
            if (v.isEditing) {
               // If click is outside that variant -> save
               const el = document.getElementById(`variant-${v.id}`);
               if (el && !el.contains(e.target)) {
                  finishEditing(v.id);
               }
            }
         });
      }

      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
   }, [variants]);

   const addVariant = () => {
      setVariants(prev => [
         ...prev,
         {
            id: Date.now(),
            name: "",
            values: [],
            tempValue: "",
            isEditing: true
         }
      ]);
   };

   // update field on change
   const updateVariantField = (id, field, value) => {
      setVariants(prev =>
         prev.map(v =>
            v.id === id ? { ...v, [field]: value } : v
         )
      );
   };

   // when user clicks outside → save & switch to view mode
   const finishEditing = (id) => {
      setVariants(prev =>
         prev.map(v => {
            if (v.id === id) {
               const cleanedValues = v.tempValue.trim()
                  ? [...v.values, v.tempValue.trim()]
                  : v.values;

               return {
                  ...v,
                  values: cleanedValues,
                  tempValue: "",
                  isEditing: false
               };
            }
            return v;
         })
      );
   };

   // add new value badge
   const addValue = (id) => {
      setVariants(prev =>
         prev.map(v => {
            if (v.id === id && v.tempValue.trim()) {
               return {
                  ...v,
                  values: [...v.values, v.tempValue.trim()],
                  tempValue: "",
               };
            }
            return v;
         })
      );
   };

   // delete variant
   const deleteVariant = (id) => {
      setVariants(prev => prev.filter(v => v.id !== id));
   };

   // enter edit mode again
   const editVariant = (id) => {
      setVariants(prev =>
         prev.map(v =>
            v.id === id ? { ...v, isEditing: true } : v
         )
      );
   };

   const toggleCard = (cardId) => {
      const body = document.querySelector(`#${cardId} .card-body`);
      const arrow = document.querySelector(`#${cardId} .arrow-icon`);

      if (!body || !arrow) return;

      body.classList.toggle("hide-body");
      arrow.classList.toggle("rotate");
   };

   // static data start
   const typeOptions = [
      { label: "Select product type", value: "" },
      { label: "Simple", value: "simple" },
      { label: "Variable", value: "variable" },
   ];

   const paymentOptions = [
      { label: "Select stock status", value: "" },
      { label: "In stock", value: "instock" },
      { label: "out of stock", value: "" },
   ];

   const stockStatusOptions = [
      { value: '', label: 'Stock Status' },
      { value: 'instock', label: 'In Stock' },
      { value: 'outofstock', label: 'Out of Stock' },
      { value: 'onbackorder', label: 'On Backorder' },
   ];

   const staticvariant = [
      { label: "red", value: "red" },
      { label: "green", value: "green" },
      { label: "blue", value: "blue" },
   ];

   const staticvariantion = [
      { label: "", value: "" },
      { label: "color", value: "" },
      { label: "size", value: "" },
      { label: "width", value: "" },
   ];

   const backorderOptions = [
      { label: "Do not allow", value: "no" },
      { label: "Allow, but notify customer", value: "notify" },
      { label: "Allow", value: "yes" }
   ];

   const handleChange = (field, value) => {
      setProduct((prev) => ({
         ...prev,
         [field]: value,
      }));
   };
   console.log('product', product)
   const createProduct = () => {
      try {
         const payload = {
               ...product, 
               meta_data: [
                  { key: "multivendorx_store_id", value: appLocalizer.store_id },
               ]
         };

         axios.put(
            `${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
            payload,
            { headers: { "X-WP-Nonce": appLocalizer.nonce } }
         )
         .then(res => {
            console.log("Product created:", res.data);
         });

      } catch (error) {
         console.error("Error:", error.response);
      }
   };

   useEffect(() => {
      axios.get(
         `${appLocalizer.apiUrl}/wc/v3/products/shipping_classes`, 
         { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
      )
      .then((res) => {
         console.log(res.data)
         const options = res.data.map(cls => ({
            value: cls.slug,
            label: cls.name
         }));
         
         setShippingClasses(options);
      });
      
   }, [])

   return (
      <>
         <div className="page-title-wrapper">
            <div className="page-title">
               <div className="title">
                  Add Product
               </div>

               <div className="des">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas accusantium obcaecati labore nam quibusdam minus.
               </div>
            </div>
            <div className="buttons-wrapper">
               <button
                  className="admin-btn btn-blue"
               >
                  Draft
               </button>
               <button
                  className="admin-btn btn-purple-bg"
                  onClick={createProduct}
               >
                  Publish
               </button>
            </div>
         </div>

         <div className="row">
            <div className="column w-10">
               <div className="checklist-wrapper">
                  <div className="checklist-title">
                     Checklist
                  </div>
                  <ul>
                     <li className="checked"><span></span> Name</li>
                     <li className="checked"><span></span> Image</li>
                     <li className="checked"><span></span> Price</li>
                     <li><span></span> Name</li>
                     <li><span></span> Image</li>
                     <li><span></span> Price</li>
                  </ul>
               </div>
            </div>

            <div className="column w-65">
               {/* General information */}
               <div className="card" id="card-general">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">General information</div>
                     </div>
                     <div className="right"><i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-general")}></i></div>
                  </div>
                  <div className="card-body">
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product name</label>
                           <BasicInput
                              name="name"
                              wrapperClass="setting-form-input"
                              value={product.name}
                              onChange={(e) => handleChange("name", e.target.value)} />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product short description</label>
                           <TextArea name="short_description" wrapperClass="setting-from-textarea"
                              inputClass="textarea-input"
                              descClass="settings-metabox-description"
                              value={product.short_description}
                              onChange={(e) => handleChange("short_description", e.target.value)}
                           />
                        </div>
                     </div>

                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product description</label>
                           <TextArea name="description" wrapperClass="setting-from-textarea"
                              inputClass="textarea-input"
                              descClass="settings-metabox-description"
                              value={product.description}
                              onChange={(e) => handleChange("description", e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product type</label>
                           <SelectInput
                              name="type"
                              options={typeOptions}
                              value={product.type}
                              onChange={(selected) => handleChange("type", selected.value)}
                           />

                        </div>
                        <div className="form-group">
                           <div className="checkbox-wrapper">
                              <div className="item">
                                 <input
                                    type="checkbox"
                                    checked={product.virtual}
                                    onChange={(e) => handleChange("virtual", e.target.checked)}
                                 />
                                 Virtual
                              </div>
                              <div className="item">
                                 <input
                                    type="checkbox"
                                    checked={product.downloadable}
                                    onChange={(e) => handleChange("downloadable", e.target.checked)}
                                 />
                                 Download
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Price and stock */}
               <div className="card" id="card-price">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">Price and stock</div>
                     </div>
                     <div className="right"><i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-price")}></i></div>
                  </div>
                  <div className="card-body">
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Regular price</label>
                           <BasicInput
                              name="regular_price"
                              wrapperClass="setting-form-input"
                              value={product.regular_price}
                              onChange={(e) => handleChange("regular_price", e.target.value)}
                           />
                        </div>
                        <div className="form-group">
                           <label htmlFor="product-name">Sale price</label>
                           <BasicInput
                              name="sale_price"
                              wrapperClass="setting-form-input"
                              value={product.sale_price}
                              onChange={(e) => handleChange("sale_price", e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">SKU</label>
                           <BasicInput
                              name="sku"
                              wrapperClass="setting-form-input"
                              value={product.sku}
                              onChange={(e) => handleChange("sku", e.target.value)}
                           />
                        </div>
                        {!product.manage_stock && (
                           <div className="form-group">
                              <label htmlFor="product-name">Stock Status</label>
                              <SelectInput
                                 name="stock_status"
                                 options={stockStatusOptions}
                                 type="single-select"
                                 value={product.stock_status}
                                 onChange={(selected) => handleChange("stock_status", selected.value)}
                              />
                           </div>
                        )}
                        <div className="form-group">
                           Stock management
                           <input
                              type="checkbox"
                              checked={product.manage_stock}
                              onChange={(e) => handleChange("manage_stock", e.target.checked)}
                           />
                        </div>

                        <div className="form-group">
                           Sold individually
                           <input
                              type="checkbox"
                              checked={product.sold_individually}
                              onChange={(e) => handleChange("sold_individually", e.target.checked)}
                           />
                        </div>
                     </div>
                     {product.manage_stock && (
                           <>
                           <div className="form-group-wrapper">
                              <div className="form-group">
                                 <label htmlFor="product-name">Quantity</label>
                                 <BasicInput
                                    name="stock"
                                    wrapperClass="setting-form-input"
                                    value={product.stock}
                                    onChange={(e) => handleChange("stock", e.target.value)}
                                 />
                              </div>
                              <div className="form-group">
                                 <label htmlFor="product-name">Allow backorders?</label>
                                 <SelectInput
                                    name="backorders"
                                    options={backorderOptions}
                                    type="single-select"
                                    value={product.backorders}
                                    onChange={(selected) => handleChange("backorders", selected.value)}
                                 />
                              </div>
                              <div className="form-group">
                                 <label htmlFor="product-name">Low stock threshold</label>
                                 <BasicInput
                                    name="low_stock_amount"
                                    wrapperClass="setting-form-input"
                                    value={product.low_stock_amount}
                                    onChange={(e) => handleChange("low_stock_amount", e.target.value)}
                                 />
                              </div>
                              </div>
                           </>
                        )}
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product URL</label>
                           <BasicInput name="address" wrapperClass="setting-form-input" />
                        </div>
                        <div className="form-group">
                           <label htmlFor="product-name">Button text</label>
                           <BasicInput name="address" wrapperClass="setting-form-input" />
                        </div>
                     </div>
                  </div>
               </div>

               { !product.virtual && (
                  <div className="card" id="card-shipping">
                     <div className="card-header">
                        <div className="left">
                           <div className="title">Shipping</div>
                        </div>
                        <div className="right"><i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-shipping")}></i></div>
                     </div>
                     <div className="card-body">
                        <div className="form-group-wrapper">
                           <div className="form-group">
                              <label htmlFor="product-name">Weight ({appLocalizer.weight_unit})</label>
                              <BasicInput 
                                 name="weight" 
                                 wrapperClass="setting-form-input" 
                                 value={product.weight}
                                 onChange={(e) => handleChange("weight", e.target.value)}
                              />
                           </div>
                           <div className="form-group">
                              <label htmlFor="product-name">Dimensions ({appLocalizer.dimension_unit})</label>
                              <BasicInput 
                                 name="product_length" 
                                 wrapperClass="setting-form-input" 
                                 value={product.product_length}
                                 placeholder="Length"
                                 onChange={(e) => handleChange("product_length", e.target.value)}
                              />
                              <BasicInput 
                                 name="product_width" 
                                 wrapperClass="setting-form-input" 
                                 value={product.product_width}
                                 placeholder="Width"
                                 onChange={(e) => handleChange("product_width", e.target.value)}
                              />
                              <BasicInput 
                                 name="product_height" 
                                 wrapperClass="setting-form-input" 
                                 value={product.product_height}
                                 placeholder="Height"
                                 onChange={(e) => handleChange("product_height", e.target.value)}
                              />
                           </div>

                           <div className="form-group">
                              <label htmlFor="product-name">Shipping classes</label>
                              <SelectInput
                                 name="shipping_class"
                                 options={shippingClasses}
                                 value={product.shipping_class}
                                 onChange={(selected) =>
                                    handleChange("shipping_class", selected.value)
                                 }
                              />

                           </div>
                        </div>
                     </div>
                  </div>
               )}

               { product.downloadable && (
                  <div className="card" id="card-downloadable">
                     <div className="card-header">
                        <div className="left">
                           <div className="title">Downloadable</div>
                        </div>
                        <div className="right"><i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-downloadable")}></i></div>
                     </div>
                     <div className="card-body">
                        <div className="form-group-wrapper">
                           
                        </div>
                     </div>
                  </div>
               )}

               {/* Variants start */}
               <div className="card" id="card-variants">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">Variations</div>
                     </div>
                     <div className="right">
                        <i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-variants")}></i>
                     </div>
                  </div>
                  <div className="card-body">
                     <div className="card-title">
                        <div className="title">
                           Attributes
                        </div>
                        <div className="buttons">
                           <div className="add-btn">
                              <div className="i adminlib-plus-circle-o"></div>
                              Add existing
                           </div>
                           <div className="add-btn" onClick={() => { setAddAttribute(true); }}>
                              <div className="i adminlib-plus-circle-o"></div>
                              Add attribute
                           </div>
                        </div>
                     </div>

                     <div className="attribute-wrapper">
                        <div className="attribute-box">
                           <div className="name-wrapper">
                              <div className="name">
                                 Colors
                              </div>
                              <div className="icons">
                                 <i className="adminlib-edit"></i>
                                 <i className="adminlib-delete"></i>
                              </div>
                           </div>
                           <div className="value-wrapper">
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                           </div>
                        </div>

                        <div className="attribute-box">
                           <div className="name-wrapper">
                              <div className="name">
                                 Colors
                              </div>
                              <div className="icons">
                                 <i className="adminlib-edit"></i>
                                 <i className="adminlib-delete"></i>
                              </div>
                           </div>
                           <div className="value-wrapper">
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                           </div>
                        </div>

                        <div className="attribute-box">
                           <div className="name-wrapper">
                              <div className="name">
                                 Colors
                              </div>
                              <div className="icons">
                                 <i className="adminlib-edit"></i>
                                 <i className="adminlib-delete"></i>
                              </div>
                           </div>
                           <div className="value-wrapper">
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                           </div>
                        </div>

                        <div className="attribute-box">
                           <div className="name-wrapper">
                              <div className="name">
                                 Colors
                              </div>
                              <div className="icons">
                                 <i className="adminlib-edit"></i>
                                 <i className="adminlib-delete"></i>
                              </div>
                           </div>
                           <div className="value-wrapper">
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                           </div>
                        </div>

                        <div className="attribute-box">
                           <div className="name-wrapper">
                              <div className="name">
                                 Colors
                              </div>
                              <div className="icons">
                                 <i className="adminlib-edit"></i>
                                 <i className="adminlib-delete"></i>
                              </div>
                           </div>
                           <div className="value-wrapper">
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Red</span>
                              <span className="admin-badge blue">Green</span>
                              <span className="admin-badge blue">Red</span>
                           </div>
                        </div>
                     </div>


                     {/* variants */}
                     <div className="card-title">
                        <div className="title">
                           Variants
                        </div>
                        <div className="buttons">
                           <div className="add-btn">
                              <div className="i adminlib-plus-circle-o"></div>
                              Generate variations
                           </div>
                           <div className="add-btn">
                              <div className="i adminlib-plus-circle-o"></div>
                              Add variant
                           </div>
                        </div>
                     </div>
                     <div className="variant-wrapper">
                        <div className="variant-box">
                           <div className="variant-items">
                              <div className="variant">
                                 <div className="value">Green</div>
                                 <div className="name">Color</div>
                              </div>

                              <div className="variant">
                                 <div className="value">XL</div>
                                 <div className="name">Size</div>
                              </div>
                              <div className="variant">
                                 <div className="value">Puma</div>
                                 <div className="name">Brand</div>
                              </div>
                           </div>
                           <div className="product">
                              <div className="image-section">
                                 <i className="adminlib-multi-product"></i>
                              </div>
                              <div className="details">
                                 <div className="sku"><b>SKU:</b> product86776</div>
                                 <div className="price">$299 - $199</div>
                                 <div className="stock">In stock - 20</div>
                              </div>
                           </div>
                           <i className="admin-badge yellow adminlib-edit edit-icon"></i>
                        </div>

                        <div className="variant-box">
                           <div className="variant-items">
                              <div className="variant">
                                 <div className="value">Green</div>
                                 <div className="name">Color</div>
                              </div>

                              <div className="variant">
                                 <div className="value">XL</div>
                                 <div className="name">Size</div>
                              </div>
                              <div className="variant">
                                 <div className="value">Puma</div>
                                 <div className="name">Brand</div>
                              </div>
                           </div>
                           <div className="product">
                              <div className="image-section">
                                 <i className="adminlib-multi-product"></i>
                              </div>
                              <div className="details">
                                 <div className="sku"><b>SKU:</b> product86776</div>
                                 <div className="price">$299 - $199</div>
                                 <div className="stock">In stock - 20</div>
                              </div>
                           </div>
                           <i className="admin-badge yellow  adminlib-edit edit-icon"></i>
                        </div>

                        <div className="variant-box">
                           <div className="variant-items">
                              <div className="variant">
                                 <div className="value">Green</div>
                                 <div className="name">Color</div>
                              </div>

                              <div className="variant">
                                 <div className="value">XL</div>
                                 <div className="name">Size</div>
                              </div>
                              <div className="variant">
                                 <div className="value">Puma</div>
                                 <div className="name">Brand</div>
                              </div>
                           </div>
                           <div className="product">
                              <div className="image-section">
                                 <i className="adminlib-multi-product"></i>
                              </div>
                              <div className="details">
                                 <div className="sku"><b>SKU:</b> product86776</div>
                                 <div className="price">$299 - $199</div>
                                 <div className="stock">In stock - 20</div>
                              </div>
                           </div>
                           <i className="admin-badge yellow adminlib-edit edit-icon"></i>
                        </div>


                     </div>
                  </div>
               </div>

               {AddAttribute && (
                  <CommonPopup
                     open={AddAttribute}
                     onClick={() => setAddAttribute(false)}
                     width="500px"
                     height="70%"
                     header={
                        <>
                           <div className="title">
                              <i className="adminlib-coupon"></i>
                              Add Attribute
                           </div>
                           <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum sint, minus voluptates esse officia enim dolorem, eaque neque error doloremque praesentium facere quidem mollitia deleniti?</p>
                           <i
                              className="icon adminlib-close"
                              onClick={() => setAddAttribute(false)}
                           ></i>
                        </>
                     }
                     footer={
                        <>
                        </>
                     }
                  >
                     <div className="content">
                        {/* start left section */}
                        <div className="form-group-wrapper">
                           <div className="form-group">
                              <label htmlFor="title">Attribute name</label>
                              <div className="attribute-popup-wrapper">
                                 <div className="field-wrapper">
                                    <SelectInput
                                       name="payment_method"
                                       options={paymentOptions}
                                       type="single-select"
                                    />
                                    <div className="add-btn"><i className="adminlib-plus-circle-o"></i> Add new</div>
                                 </div>
                                 <div className="field-wrapper">
                                    <BasicInput name="address" wrapperClass="setting-form-input" />
                                    <div className="add-btn"><i className="adminlib-form-checkboxes"></i> Save </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* {error && <p className="error-text">{error}</p>} */}
                  </CommonPopup>
               )}
            </div>

            {/* right column */}
            <div className="column w-35">
               {/* ai assist */}
               <div className="card" id="card-ai-assist">
                  <div className="card-header">+
                     <div className="left">
                        <div className="title">AI assist</div>
                     </div>
                     <div className="right"><i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-ai-assist")}></i></div>
                  </div>
                  <div className="card-body">
                     <div className="ai-assist-wrapper">
                        <div className="suggestions-wrapper">
                           <div className="suggestions-title">
                              Suggestions
                           </div>
                           <div className="box">
                              <span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi veniam doloremque omnis aspernatur similique alias vel illo ut, corrupti recusandae quo nulla, reprehenderit harum vitae!</span>
                           </div>
                           <div className="box">
                              <span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi veniam doloremque omnis aspernatur similique alias vel illo ut, corrupti recusandae quo nulla, reprehenderit harum vitae!</span>
                           </div>
                        </div>
                        <div className="sender-wrapper">
                           <input type="text" placeholder="Write the prompt or select an example" />
                           <div className="icon-wrapper">
                              <i className="adminlib-mail"></i>
                              <i className="adminlib-send"></i>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="card">
                  <div className="card-header">
                     <div className="left">
                        <div className="title"></div>
                     </div>
                     <div className="right"><i className="adminlib-pagination-right-arrow  arrow-icon"></i></div>
                  </div>
                  <div className="card-body">
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Visibility</label>
                           <ToggleSetting
                              wrapperClass="setting-form-input"
                              descClass="settings-metabox-description"
                              // description="Select the status of the announcement."
                              options={[
                                 { key: 'draft', value: 'draft', label: 'Shop and search results' },
                                 { key: 'pending', value: 'pending', label: 'Shop only' },
                                 // { key: 'publish', value: 'publish', label: 'Search results only' },
                                 { key: 'publish', value: 'publish', label: 'Hidden' },
                              ]}
                           // value={formData.status}
                           // onChange={handleToggleChange}
                           />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product category</label>
                           <SelectInput
                              name="payment_method"
                              options={paymentOptions}
                              type="single-select"
                           />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product tag</label>
                           <SelectInput
                              name="payment_method"
                              options={paymentOptions}
                              type="single-select"
                           />
                        </div>
                     </div>
                  </div>
               </div>
               {/* image upload */}
               <div className="card" id="card-image-upload">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">Upload image</div>
                     </div>
                     <div className="right"><i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-image-upload")}></i></div>
                  </div>
                  <div className="card-body">
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Features Image</label>
                           <FileInput
                              // value={formData.image}
                              inputClass="form-input"
                              name="image"
                              type="hidden"
                              // onButtonClick={() => runUploader('image')}
                              imageWidth={75}
                              imageHeight={75}
                              openUploader="Upload Image"
                              // imageSrc={imagePreviews.image}
                              buttonClass="admin-btn btn-purple"
                              descClass="settings-metabox-description"
                           />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product gallery</label>
                           <FileInput
                              // value={formData.image}
                              inputClass="form-input"
                              name="image"
                              type="hidden"
                              // onButtonClick={() => runUploader('image')}
                              imageWidth={75}
                              imageHeight={75}
                              openUploader="Upload Image"
                              // imageSrc={imagePreviews.image}
                              buttonClass="admin-btn btn-purple"
                              descClass="settings-metabox-description"
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}

export default AddProduct