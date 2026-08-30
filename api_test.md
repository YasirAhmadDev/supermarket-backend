=========================================================================
POSTMAN TEST SEQUENCE — Zahid Babakarkhil Supermarket Billing System
Base URL: http://localhost:5000/api/v1
=========================================================================
NOTE: Postman will auto-save cookies (accessToken, refreshToken) if you
enable "Automatically follow redirects" + cookie jar is on by default.
For protected routes, Postman will send cookies automatically once you
log in within the same Postman session/tab.
=========================================================================


-------------------------------------------------------------------------
STEP 0: TEMPORARILY UNPROTECT /auth/register
-------------------------------------------------------------------------
// In auth.routes.js, comment out verifyJWT + authorizeRoles on /register
// so we can create the very FIRST admin user without needing a token.
//
// router.post('/register', registerUser);   <-- temporarily like this
//
// Remember to put the protection back after Step 1.


-------------------------------------------------------------------------
STEP 1: REGISTER FIRST ADMIN
-------------------------------------------------------------------------
POST /auth/register

// Body (raw JSON):
{
  "name": "Zahid Babakarkhil",
  "email": "admin@zbsupermarket.com",
  "password": "Admin@123",
  "role": "admin"
}

// Expected Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "_id": "665f1c2e8a1b2c3d4e5f6789",
    "name": "Zahid Babakarkhil",
    "email": "admin@zbsupermarket.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "User registered successfully",
  "success": true
}

// ⚠️ After this succeeds, put back verifyJWT + authorizeRoles('admin')
// on the /register route in auth.routes.js, then restart server.


-------------------------------------------------------------------------
STEP 2: LOGIN AS ADMIN
-------------------------------------------------------------------------
POST /auth/login

// Body (raw JSON):
{
  "email": "admin@zbsupermarket.com",
  "password": "Admin@123"
}

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "665f1c2e8a1b2c3d4e5f6789",
      "name": "Zahid Babakarkhil",
      "email": "admin@zbsupermarket.com",
      "role": "admin",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "success": true
}

// Cookies set: accessToken, refreshToken (httpOnly)
// Postman will auto-attach these cookies to all future requests
// in the same workspace/session — no need to manually copy the token.


-------------------------------------------------------------------------
STEP 3: GET CURRENT USER (verify auth works)
-------------------------------------------------------------------------
GET /auth/me

// No body needed. Cookie sent automatically.

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "_id": "665f1c2e8a1b2c3d4e5f6789",
    "name": "Zahid Babakarkhil",
    "email": "admin@zbsupermarket.com",
    "role": "admin",
    "isActive": true
  },
  "message": "Current user fetched",
  "success": true
}

// If this fails with 401, your cookie wasn't sent — check Postman
// cookie settings or use Authorization: Bearer <accessToken> header instead.


-------------------------------------------------------------------------
STEP 4: REGISTER A CASHIER (admin-only action)
-------------------------------------------------------------------------
POST /auth/register

// Body (raw JSON):
{
  "name": "Cashier One",
  "email": "cashier1@zbsupermarket.com",
  "password": "Cashier@123",
  "role": "cashier"
}

// Expected Response: 201 Created
// Same shape as Step 1, role: "cashier"


-------------------------------------------------------------------------
STEP 5: CREATE A CATEGORY
-------------------------------------------------------------------------
POST /categories

// Body (raw JSON):
{
  "name": "Beverages"
}

// Expected Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "_id": "665f1d3f8a1b2c3d4e5f67aa",
    "name": "Beverages",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Category created",
  "success": true
}

// 📌 SAVE this _id — you'll need it as "category" when creating products.

// Create one or two more categories the same way:
{ "name": "Snacks" }
{ "name": "Dairy" }


-------------------------------------------------------------------------
STEP 6: GET ALL CATEGORIES
-------------------------------------------------------------------------
GET /categories

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": [
    { "_id": "...", "name": "Beverages" },
    { "_id": "...", "name": "Dairy" },
    { "_id": "...", "name": "Snacks" }
  ],
  "message": "Categories fetched",
  "success": true
}


-------------------------------------------------------------------------
STEP 7: CREATE A PRODUCT
-------------------------------------------------------------------------
POST /products

// Body (raw JSON) — use the Beverages category _id from Step 5:
{
  "name": "Coca-Cola 500ml",
  "barcode": "8901234567890",
  "category": "665f1d3f8a1b2c3d4e5f67aa",
  "unit": "pcs",
  "purchasePrice": 30,
  "sellingPrice": 50,
  "taxPercent": 5,
  "stockQuantity": 100,
  "lowStockThreshold": 10
}

// Expected Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "_id": "665f1e4a8a1b2c3d4e5f67bb",
    "name": "Coca-Cola 500ml",
    "barcode": "8901234567890",
    "category": "665f1d3f8a1b2c3d4e5f67aa",
    "sellingPrice": 50,
    "stockQuantity": 100,
    ...
  },
  "message": "Product created",
  "success": true
}

// 📌 SAVE this _id — needed for billing test in Step 12.

// Create 2-3 more products the same way for realistic testing, e.g.:
{
  "name": "Lays Chips 50g",
  "barcode": "8901234567891",
  "category": "<snacks category id>",
  "sellingPrice": 20,
  "taxPercent": 5,
  "stockQuantity": 50,
  "lowStockThreshold": 5
}


-------------------------------------------------------------------------
STEP 8: GET ALL PRODUCTS (with search)
-------------------------------------------------------------------------
GET /products
GET /products?search=coca
GET /products?category=665f1d3f8a1b2c3d4e5f67aa
GET /products?lowStock=true

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "_id": "665f1e4a8a1b2c3d4e5f67bb",
      "name": "Coca-Cola 500ml",
      "category": { "_id": "...", "name": "Beverages" },
      "sellingPrice": 50,
      "stockQuantity": 100
    }
  ],
  "message": "Products fetched",
  "success": true
}


-------------------------------------------------------------------------
STEP 9: GET PRODUCT BY BARCODE (used in POS scan flow)
-------------------------------------------------------------------------
GET /products/barcode/8901234567890

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "_id": "665f1e4a8a1b2c3d4e5f67bb",
    "name": "Coca-Cola 500ml",
    "sellingPrice": 50,
    "stockQuantity": 100
  },
  "message": "Product fetched",
  "success": true
}

// Test failure case too:
GET /products/barcode/0000000000000
// Expected: 404 Not Found
{
  "statusCode": 404,
  "message": "Product not found for this barcode",
  "success": false,
  "errors": []
}


-------------------------------------------------------------------------
STEP 10: UPDATE A PRODUCT (e.g. price change / restock)
-------------------------------------------------------------------------
PUT /products/665f1e4a8a1b2c3d4e5f67bb

// Body (raw JSON):
{
  "sellingPrice": 55,
  "stockQuantity": 150
}

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "_id": "665f1e4a8a1b2c3d4e5f67bb",
    "sellingPrice": 55,
    "stockQuantity": 150
  },
  "message": "Product updated",
  "success": true
}


-------------------------------------------------------------------------
STEP 11: CREATE A CUSTOMER
-------------------------------------------------------------------------
POST /customers

// Body (raw JSON):
{
  "name": "Ahmad Wali",
  "phone": "0700123456"
}

// Expected Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "_id": "665f1f5b8a1b2c3d4e5f67cc",
    "name": "Ahmad Wali",
    "phone": "0700123456",
    "loyaltyPoints": 0,
    "totalPurchases": 0
  },
  "message": "Customer created",
  "success": true
}

// 📌 SAVE this _id for the billing test.


-------------------------------------------------------------------------
STEP 12: CREATE A BILL (core feature — this deducts stock!)
-------------------------------------------------------------------------
POST /bills

// Body (raw JSON) — use product _id from Step 7 and customer _id from Step 11:
{
  "items": [
    {
      "productId": "665f1e4a8a1b2c3d4e5f67bb",
      "quantity": 2
    }
  ],
  "customerId": "665f1f5b8a1b2c3d4e5f67cc",
  "discount": 0,
  "paymentMethod": "cash"
}

// Expected Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "_id": "665f20668a1b2c3d4e5f67dd",
    "invoiceNumber": "INV-00001",
    "customer": "665f1f5b8a1b2c3d4e5f67cc",
    "cashier": "665f1c2e8a1b2c3d4e5f6789",
    "items": [
      {
        "product": "665f1e4a8a1b2c3d4e5f67bb",
        "name": "Coca-Cola 500ml",
        "quantity": 2,
        "price": 55,
        "taxPercent": 5,
        "total": 115.5
      }
    ],
    "subTotal": 110,
    "totalTax": 5.5,
    "discount": 0,
    "grandTotal": 115.5,
    "paymentMethod": "cash",
    "paymentStatus": "paid",
    "createdAt": "..."
  },
  "message": "Bill created successfully",
  "success": true
}

// ✅ VERIFY: Go back to Step 8 (GET /products) and confirm
// Coca-Cola stockQuantity dropped from 150 to 148.


-------------------------------------------------------------------------
STEP 13: TEST INSUFFICIENT STOCK ERROR
-------------------------------------------------------------------------
POST /bills

// Body — request way more than available stock:
{
  "items": [
    {
      "productId": "665f1e4a8a1b2c3d4e5f67bb",
      "quantity": 99999
    }
  ],
  "paymentMethod": "cash"
}

// Expected Response: 400 Bad Request
{
  "statusCode": 400,
  "message": "Insufficient stock for Coca-Cola 500ml. Available: 148",
  "success": false,
  "errors": []
}

// ✅ VERIFY: stock should NOT have changed (transaction rolled back).


-------------------------------------------------------------------------
STEP 14: GET ALL BILLS
-------------------------------------------------------------------------
GET /bills
GET /bills?from=2026-06-01&to=2026-06-30

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "_id": "665f20668a1b2c3d4e5f67dd",
      "invoiceNumber": "INV-00001",
      "customer": { "name": "Ahmad Wali", "phone": "0700123456" },
      "cashier": { "name": "Zahid Babakarkhil" },
      "grandTotal": 115.5,
      "createdAt": "..."
    }
  ],
  "message": "Bills fetched",
  "success": true
}


-------------------------------------------------------------------------
STEP 15: GET SINGLE BILL (for printing receipt)
-------------------------------------------------------------------------
GET /bills/665f20668a1b2c3d4e5f67dd

// Expected Response: 200 OK
// Full bill detail with populated product/customer/cashier info


-------------------------------------------------------------------------
STEP 16: DASHBOARD STATS
-------------------------------------------------------------------------
GET /reports/dashboard

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "todaySalesCount": 1,
    "todaySalesTotal": 115.5,
    "totalBillsCount": 1,
    "lowStockCount": 0,
    "lowStockProducts": [],
    "recentBills": [ ... ]
  },
  "message": "Dashboard stats fetched",
  "success": true
}


-------------------------------------------------------------------------
STEP 17: SALES REPORT (grouped by day)
-------------------------------------------------------------------------
GET /reports/sales?from=2026-06-01&to=2026-06-30

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": [
    { "_id": "2026-06-25", "totalSales": 115.5, "billCount": 1 }
  ],
  "message": "Sales report fetched",
  "success": true
}


-------------------------------------------------------------------------
STEP 18: TOP PRODUCTS REPORT
-------------------------------------------------------------------------
GET /reports/top-products?limit=5

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "_id": "665f1e4a8a1b2c3d4e5f67bb",
      "name": "Coca-Cola 500ml",
      "totalQuantitySold": 2,
      "totalRevenue": 115.5
    }
  ],
  "message": "Top products fetched",
  "success": true
}


-------------------------------------------------------------------------
STEP 19: LOGOUT
-------------------------------------------------------------------------
POST /auth/logout

// Expected Response: 200 OK
{
  "statusCode": 200,
  "data": {},
  "message": "Logged out successfully",
  "success": true
}

// Cookies cleared. Try GET /auth/me again — should now return 401.


-------------------------------------------------------------------------
STEP 20: TEST ROLE PROTECTION (login as cashier, try admin action)
-------------------------------------------------------------------------
// Login as cashier1@zbsupermarket.com (Step 4 credentials)
POST /auth/login
{ "email": "cashier1@zbsupermarket.com", "password": "Cashier@123" }

// Then try:
DELETE /products/665f1e4a8a1b2c3d4e5f67bb

// Expected Response: 403 Forbidden
{
  "statusCode": 403,
  "message": "Role 'cashier' is not allowed to access this resource",
  "success": false,
  "errors": []
}

// ✅ This confirms role-based access control is working correctly.
=========================================================================
END OF TEST SEQUENCE
=========================================================================