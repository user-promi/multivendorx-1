import { Radio } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { BasicInput, FileInput, SelectInput, TextArea, ToggleSetting } from "zyra";

const AddProduct = () => {
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
   const paymentOptions = [
      { label: "Select stock status", value: "" },
      { label: "In stock", value: "" },
      { label: "out of stock", value: "" },
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


   return (
      <>
         <div className="page-title-wrapper">
            <div className="page-title">
               <div className="title">
                  Add Order
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
                           <BasicInput name="address" wrapperClass="setting-form-input" />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product short description</label>
                           <TextArea name="shipping_policy" wrapperClass="setting-from-textarea"
                              inputClass="textarea-input"
                              descClass="settings-metabox-description"
                           />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Product type</label>
                           <SelectInput
                              name="payment_method"
                              options={paymentOptions}
                              type="single-select"
                           />
                        </div>
                        <div className="form-group">
                           <div className="checkbox-wrapper">
                              <div className="item">
                                 <input type="checkbox" />
                                 Virtual
                              </div>
                              <div className="item">
                                 <input type="checkbox" />
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
                           <BasicInput name="address" wrapperClass="setting-form-input" />
                        </div>
                        <div className="form-group">
                           <label htmlFor="product-name">Sale price</label>
                           <BasicInput name="address" wrapperClass="setting-form-input" />
                        </div>
                     </div>
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">SKU</label>
                           <BasicInput name="address" wrapperClass="setting-form-input" />
                        </div>
                        <div className="form-group">
                           <label htmlFor="product-name">Stock Status</label>
                           <SelectInput
                              name="payment_method"
                              options={paymentOptions}
                              type="single-select"
                           />
                        </div>
                     </div>
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

               {/* Attributes start */}
               {/* <div className="card" id="card-variants">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">Attributes</div>
                     </div>
                     <div className="right">
                        <SelectInput
                           name="payment_method"
                           options={staticvariantion}
                           type="multi-select"
                           size="fit-content"
                        />
                        <div className="admin-btn btn-purple-bg" onClick={addVariant}>Add variant</div>
                        <i className="adminlib-pagination-right-arrow  arrow-icon" onClick={() => toggleCard("card-variants")}></i>
                     </div>
                  </div>
                  <div className="card-body">
                     <div className="form-group-wrapper">
                        <div className="form-group">
                           <label htmlFor="product-name">Variant name</label>
                           <div className="variant-wrapper" ref={wrapperRef}>
                              {variants.map((variant) => (
                                 <div
                                    className={`variant ${variant.isEditing ? "edit" : ""}`}
                                    key={variant.id}
                                    id={`variant-${variant.id}`}
                                 >
                                    {variant.isEditing ? (
                                       <div className="variant-details">

                                          <div className="variant-name">
                                             <input
                                                type="text"
                                                className="basic-input"
                                                placeholder="enter variant name"
                                                value={variant.name}
                                                onChange={(e) =>
                                                   updateVariantField(variant.id, "name", e.target.value)
                                                }
                                             />
                                          </div>

                                          <div className="variant-value-edit">
                                             <input
                                                type="text"
                                                className="basic-input"
                                                placeholder="enter new value"
                                                value={variant.tempValue}
                                                onChange={(e) =>
                                                   updateVariantField(
                                                      variant.id,
                                                      "tempValue",
                                                      e.target.value
                                                   )
                                                }
                                                onKeyDown={(e) => e.key === "Enter" && addValue(variant.id)}
                                             />

                                             <SelectInput
                                                name="variant-values"
                                                options={staticvariant}
                                                type="multi-select"
                                                placeholder="add values"
                                                value={variant.values.map(v => ({
                                                   label: v,
                                                   value: v
                                                }))}
                                                onChange={(
                                                   selected
                                                ) =>
                                                   updateVariantField(
                                                      variant.id,
                                                      "values",
                                                      (selected || []).map(s => s.value)
                                                   )
                                                }
                                             />

                                          </div>
                                       </div>
                                    ) : (
                                       <div className="variant-details">
                                          <div className="variant-name">{variant.name}</div>

                                          <div className="variant-value">
                                             {variant.values.map((v, i) => (
                                                <span className="admin-badge blue" key={i}>{v}</span>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    <div className="icon-wrapper">
                                       <i
                                          className="adminlib-edit"
                                          onClick={() => editVariant(variant.id)}
                                          style={{ cursor: "pointer" }}
                                       ></i>

                                       <i
                                          className="adminlib-delete delete-icon"
                                          onClick={() => deleteVariant(variant.id)}
                                          style={{ cursor: "pointer" }}
                                       ></i>
                                    </div>
                                 </div>
                              ))}
                           </div>


                        </div>
                     </div>
                  </div>
               </div> */}

               {/* Variants start */}
               <div className="card" id="card-variants">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">variations</div>
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
                        <div className="add-btn">
                           <div className="i adminlib-plus-circle-o"></div>
                           Add attribute
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
            </div>

            {/* right column */}
            <div className="column w-35">
               {/* ai assist */}
               <div className="card" id="card-ai-assist">
                  <div className="card-header">
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