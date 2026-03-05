Komstickr: Sticker Sales Management System
===========================================

A full-stack web application for tracking and managing inventory and sales of Komsai.Org stickers.
Built uisng **FERN (Firebase, Express, React, Node.js)**.

Features
=========
- Add, update, and delete stickers (CRUD)
- Add multiple stickers to a cart
- Automatic total price calculation
- Payment method selection
- Transaction history
    - View total revenue within range of dates
    - Overall total revenue, total revenue for individual payment methods
- Firebase Firestore database integration

Tech Stack
===========

## Frontend
- React (TypeScript)
- React Hooks
- Tailwind

## Backend
- Node.js
- Express.js

## Database
- Firebase Firestore

Installation Guide
===================

## Clone the repository
git clone https://github.com/jul00/CMSC129-Lab1-BretanaJ_KomsaiSalesTracker.git
cd CMSC129-Lab1-BretanaJ_KomsaiSalesTracker

## Frontend
cd client
npm install

## Backend
cd server
npm install

## Setup Environment Variables
Create a .env file inside the **server** folder:
PORT = 5000
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
*(Replace with Firebase config values.)*

## Run the application (Back and front end)
cd client
npm run dev

Server runs on:
http://localhost:5000

App runs on: 
http://localhost:3000

Usage Guide
============

## Adding Stickers
1. Navigate to the inventory page
2. Enter sticker name, price, and stock
3. Click **Add Sticker**

## Making a Sale
1. Go to the Sales page
2. Click stickers to add to cart
3. Adjust quantities if needed
4. Select payment method
5. Confirm transaction

The system will:
- Calculate total automatically
- Save transaction in database
- Update sticker stock

API Documentation
==================
Base URL: 
http://localhost:5000/api

Sticker Endpoints
==================

## GET /stickers
Returns all stickers.
[
  {
    "id": "abc123",
    "name": "Anime Sticker",
    "price": 50,
    "stock": 20
  }
]

## POST /stickers
Creates a new sticker.
Request body:
{
  "name": "Cute Cat",
  "price": 30,
  "stock": 100
}

## PUT /stickers/:id
Updates a sticker.

## DELETE /stickers/:id
Deletes a sticker.

Sales Endpoints
================

## POST /sales
Creates a transaction.
Request body:
{
  "items": [
    {
      "id": "abc123",
      "quantity": 2
    }
  ],
  "paymentMethod": "Cash",
  "totalAmount": 100
}

## GET /sales
Returns all transactions.