
const AddProduct = () => {
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

         <div className="container-wrapper">
            <div className="card-wrapper ">
               <div className="card-content">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">General information</div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="card-wrapper">
               <div className="card-content">
                  <div className="card-header">
                     <div className="left">
                        <div className="title">AI Assist</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}

export default AddProduct