# Diagramme de la Base de Données

Ce diagramme représente la structure complète de la base de données de notre API, montrant toutes les tables et leurs relations.

```mermaid
erDiagram
    USERS ||--o{ INTERNAL_PRODUCTS : sells
    USERS ||--o{ ORDERS : "buys as buyer"
    USERS ||--o{ ORDERS : "sells as seller"
    USERS {
        int id PK
        string firstName
        string lastName
        string phone
        text address
        string zipCode
        string city
        string country
        string email
        string password
        string role
    }
    
    PRODUCTS ||--o{ INTERNAL_PRODUCTS : "has variants"
    PRODUCTS {
        int id PK
        string code UK
        string name
        string brand
        text categories
        string labels
        string quantity
        text image_url
        text image_nutrition_url
    }
    
    INTERNAL_PRODUCTS {
        int id PK
        int productId FK
        int sellerId FK
        decimal price
        int stock
        string status
    }
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS {
        int id PK
        int buyerId FK
        int sellerId FK
        decimal totalAmount
        enum status
        timestamp orderDate
    }
    
    ORDER_ITEMS {
        int id PK
        int orderId FK
        int productId FK
        int quantity
        decimal price
    }
    
    CART {
        int id PK
        int userId FK
        int productId FK
        int quantity
    }
    
    CONTACT {
        int id PK
        string name
        string email
        string subject
        text message
    }
    
    INVOICE {
        int id PK
        int orderId FK
        string invoiceNumber
        decimal amount
        date issueDate
        enum status
    }
```

## Description des Tables

### USERS
Table principale des utilisateurs pouvant être acheteurs ou vendeurs.
- Relations :
  * Peut vendre plusieurs produits (INTERNAL_PRODUCTS)
  * Peut avoir plusieurs commandes en tant qu'acheteur
  * Peut avoir plusieurs commandes en tant que vendeur

### PRODUCTS
Catalogue général des produits disponibles.
- Relations :
  * Peut avoir plusieurs variantes internes (INTERNAL_PRODUCTS)

### INTERNAL_PRODUCTS
Représente les produits spécifiques à chaque vendeur.
- Relations :
  * Appartient à un PRODUCT
  * Appartient à un vendeur (USER)

### ORDERS
Gestion des commandes.
- Relations :
  * Liée à un acheteur (USER)
  * Liée à un vendeur (USER)
  * Contient plusieurs ORDER_ITEMS

### ORDER_ITEMS
Détails des produits dans une commande.
- Relations :
  * Appartient à une commande (ORDER)
  * Référence un produit (PRODUCT)

### CART
Panier d'achats temporaire.
- Relations :
  * Lié à un utilisateur (USER)
  * Contient des références aux produits (PRODUCT)

### CONTACT
Stockage des messages de contact.
- Pas de relations directes avec d'autres tables

### INVOICE
Gestion des factures.
- Relations :
  * Liée à une commande (ORDER)
