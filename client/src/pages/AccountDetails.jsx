// import React, { useState, useEffect } from "react";

// import { Link, useLocation } from "react-router-dom";
// import { fetchProfile, updateProfile } from "../api"; // Import new APIs
// import toast from "react-hot-toast";
// import { useDispatch } from "react-redux";
// // import { setUser } from "../redux/action/userAction"; // Optional: If you want to update Redux state immediately

// const AccountDetails = () => {
//     const location = useLocation();
//     const currentPath = location.pathname;
//     // const dispatch = useDispatch();

//     // --- STATE ---
//     const [formData, setFormData] = useState({
//         firstName: "",
//         lastName: "",
//         email: ""
//     });
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);

//     // --- FETCH USER DATA ---
//     useEffect(() => {
//         const loadUserData = async () => {
//             setLoading(true);
//             try {
//                 const user = await fetchProfile();
//                 setFormData({
//                     firstName: user.firstName || "",
//                     lastName: user.lastName || "",
//                     email: user.email || ""
//                 });
//             } catch (error) {
//                 console.error("Error loading profile:", error);
//                 toast.error("Failed to load profile data");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadUserData();
//     }, []);

//     // --- HANDLE INPUT CHANGE ---
//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     // --- HANDLE FORM SUBMIT ---
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true);

//         try {
//             // Prepare data (exclude email as it cannot be changed)
//             const updateData = {
//                 firstName: formData.firstName,
//                 lastName: formData.lastName
//             };

//             const response = await updateProfile(updateData);

//             toast.success(response.message || "Profile updated successfully!");

//             // Optional: Update global Redux state if you have an action for it
//             // dispatch(setUser(response.user));

//         } catch (error) {
//             console.error("Update failed:", error);
//             toast.error(error.message || "Failed to update profile");
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <>


//             <div className="container my-5 py-4">

//                 {/* Page Title */}
//                 <div className="row mb-4">
//                     <div className="col-12">
//                         <h2 className="display-6 fw-bold">My Account</h2>
//                     </div>
//                 </div>

//                 <div className="row">

//                     {/* --- LEFT SIDEBAR --- */}
//                     <div className="col-lg-3 col-md-4 mb-4">
//                         <div className="account-sidebar shadow-sm">
//                             <Link
//                                 to="/orders"
//                                 className={`sidebar-link ${currentPath === '/orders' ? 'active' : ''}`}
//                             >
//                                 <span><i className="fa fa-shopping-bag me-2"></i> Orders</span>
//                                 <i className="fa fa-chevron-right small"></i>
//                             </Link>

//                             <Link
//                                 to="/account-details"
//                                 className={`sidebar-link ${currentPath === '/account-details' ? 'active' : ''}`}
//                             >
//                                 <span><i className="fa fa-user me-2"></i> Account Details</span>
//                                 <i className="fa fa-chevron-right small"></i>
//                             </Link>

//                             <Link
//                                 to="/login"
//                                 className="sidebar-link text-danger"
//                             >
//                                 <span><i className="fa fa-sign-out me-2"></i> Logout</span>
//                             </Link>
//                         </div>
//                     </div>

//                     {/* --- RIGHT CONTENT (Form) --- */}
//                     <div className="col-lg-9 col-md-8">
//                         <div className="contact-card">
//                             <h4 className="fw-bold mb-4">Account Details</h4>

//                             {loading ? (
//                                 <p className="text-center py-5">Loading profile...</p>
//                             ) : (
//                                 <form onSubmit={handleSubmit}>

//                                     {/* Personal Info */}
//                                     <div className="row mb-3">
//                                         <div className="col-md-6 mb-3 mb-md-0">
//                                             <label className="form-label">First Name *</label>
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 name="firstName"
//                                                 value={formData.firstName}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="col-md-6">
//                                             <label className="form-label">Last Name *</label>
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 name="lastName"
//                                                 value={formData.lastName}
//                                                 onChange={handleChange}
//                                                 required
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="mb-3">
//                                         <label className="form-label">Email Address *</label>
//                                         <input
//                                             type="email"
//                                             className="form-control bg-light"
//                                             name="email"
//                                             value={formData.email}
//                                             disabled // API restriction
//                                             style={{ cursor: 'not-allowed' }}
//                                         />
//                                         <div className="form-text">Email address cannot be changed.</div>
//                                     </div>

//                                     {/* Submit */}
//                                     <button
//                                         className="btn-submit-contact mt-2 w-auto px-5"
//                                         type="submit"
//                                         disabled={saving}
//                                     >
//                                         {saving ? (
//                                             <span><i className="fa fa-spinner fa-spin me-2"></i> Saving...</span>
//                                         ) : "Save Changes"}
//                                     </button>

//                                 </form>
//                             )}
//                         </div>
//                     </div>

//                 </div>
//             </div>


//         </>
//     );
// };

// export default AccountDetails;