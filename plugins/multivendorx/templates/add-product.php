<div class="content-wrapper">
    <div class="page-title-wrapper">
        <div class="page-title">
            <div class="title">Edit Product</div>
            <div class="breadcrumbs">
                <span><a href="#">Products</a></span>
                <span> / <a href="">Edit Product</a></span>
            </div>
        </div>

        <div class="buttons-wrapper">
            <div class="admin-btn btn-purple">
                Save draft
            </div>
            <div class="admin-btn btn-purple">
                Publish product
            </div>
        </div>
    </div>

    <div class="container-wrapper">
        <div class="card-wrapper width-65">
            <div class="card-content">
                <div class="card-title">Product information</div>
                <div class="form-group-wrapper">
                    <div class="form-group"><label for="product-name">Name</label>
                        <div class=" "><input class="basic-input " type="text" name="name" value=""></div>
                    </div>
                </div>
                <div class="form-group-wrapper">
                    <div class="form-group"><label for="product-name">Slug</label>
                        <div class=" "><input class="basic-input " type="text" name="slug" value=""></div>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="card-title">Product short description</div>
                <div class="form-group-wrapper">
                    <div class="form-group"><textarea class="textarea-input" name="description" rows="4"
                            cols="50"></textarea></div>
                </div>
            </div>
            <div class="card-content">
                <div class="card-title">Product description</div>
                <div class="form-group-wrapper">
                    <div class="form-group"><textarea class="textarea-input" name="description" rows="4"
                            cols="50"></textarea></div>
                </div>
            </div>
            <div class="card-content">
                <div class="right-form-wrapper">
                    <div class="form-group">
                        <label for="product-type">Product Type: </label>
                        <select class="basic-select" id="product-type" name="product-type">
                            <option value="simple" selected="selected">Simple product</option>
                            <option value="grouped">Grouped product</option>
                            <option value="external">External/Affiliate product</option>
                            <option value="variable">Variable product</option>
                            <option value="booking">Bookable product</option>
                            <option value="appointment">Appointable product</option>
                            <option value="subscription">Simple subscription</option>
                            <option value="variable-subscription">Variable subscription</option>
                            <option value="accommodation-booking">Accommodation product</option>
                            <option value="bundle">Product bundle</option>
                            <option value="auction">Auction</option>
                            <option value="redq_rental">Rental Product</option>
                            <option value="gift-card">Gift Card</option>
                        </select>
                    </div>
                </div>

                <!-- Product Type tabs start -->
                <div class="content">
                    <div class="tab-titles">
                        <div class="title active" id="general-tab">
                            <h2>General</h2>
                        </div>
                        <div class="title" id="inventory-tab">
                            <h2>Inventory</h2>
                        </div>
                        <div class="title" id="shipping-tab">
                            <h2>Shipping</h2>
                        </div>
                        <div class="title" id="linked-products-tab">
                            <h2>Linked Products</h2>
                        </div>
                    </div>

                    <div class="tab-content">
                        <div class="tab-panel" id="general">
                            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. In distinctio velit sit qui veritatis necessitatibus?.</p>
                        </div>
                        <div class="tab-panel" id="inventory" style="display:none;">
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat voluptatibus quidem blanditiis ut facere harum cumque. Tempore, blanditiis molestias, consequuntur reprehenderit laboriosam dolore dolorum, omnis numquam corporis iusto accusantium provident cupiditate praesentium. Et, reiciendis. Reiciendis.</p>
                        </div>
                        <div class="tab-panel" id="shipping" style="display:none;">
                            <p>Lorem ipsum dolor sit amet.</p>
                        </div>
                        <div class="tab-panel" id="linked-products" style="display:none;">
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis animi totam incidunt numquam iusto est?</p>
                        </div>
                    </div>

                </div> <!-- Product Type tabs start -->

            </div>
        </div>

        <!-- right section start -->
        <div class="card-wrapper width-35">
            <div class="card-content">
                <div class="card-title">Upload Image</div>
                <div class="form-group-wrapper">
                    <div class="form-group"><label for="product-name">Feature image</label>
                        <div class="file-uploader   "
                            style="background-image: url(&quot;http://localhost:8889/wp-content/plugins/multivendorx/release/assets/js/../images/default5b4e5f67eaa946fd23dc.png&quot;);">
                            <i class="adminlib-cloud-upload"></i><input class="form-input" type="hidden"
                                name="image"><span class="title">Drag and drop your file
                                here</span><span>Or</span><button class="admin-btn btn-purple admin-btn"
                                type="button">Upload Image</button>
                            <div class="overlay">
                                <div class="button-wrapper"><button class="admin-btn btn-red"
                                        type="button">Remove</button><button class="admin-btn btn-purple"
                                        type="button">Replace</button></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group-wrapper">
                    <div class="form-group"><label for="product-name">Product gallery</label>
                        <div class="file-uploader   "
                            style="background-image: url(&quot;http://localhost:8889/wp-content/plugins/multivendorx/release/assets/js/../images/banner-placeholder0fce5a9d0b5ce3a49dba.jpg&quot;);">
                            <i class="adminlib-cloud-upload"></i><input class="form-input" type="hidden"
                                name="banner"><span class="title">Drag and drop your file
                                here</span><span>Or</span><button class="admin-btn btn-purple admin-btn"
                                type="button">Upload Image</button>
                            <div class="overlay">
                                <div class="button-wrapper"><button class="admin-btn btn-red"
                                        type="button">Remove</button><button class="admin-btn btn-purple"
                                        type="button">Replace</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <div class="card-title">Product categories</div>
                <div class="form-group-wrapper">

                </div>
            </div>
            <div class="card-content">
                <div class="card-title">Product tags</div>
                <div class="form-group-wrapper">

                </div>
            </div>
            <div class="card-content">
                <div class="card-title">Brands</div>
                <div class="form-group-wrapper">

                </div>
            </div>
        </div> <!-- right section end -->
    </div>
</div>
</div>