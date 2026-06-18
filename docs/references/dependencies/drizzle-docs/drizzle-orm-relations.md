# Drizzle Relations Fundamentals

In the world of databases, especially relational databases, the concept of relations is absolutely fundamental. Think of “relations” as the connections and links between different pieces of data. Just like in real life, where people have relationships with each other, or objects are related to categories, databases use relations to model how different types of information are connected and work together.

### Normalization

Normalization is the process of organizing data in your database to reduce redundancy (duplication) and improve data integrity (accuracy and consistency). Think of it like tidying up a messy filing cabinet. Instead of having all sorts of papers crammed into one folder, you organize them into logical folders and categories to make everything easier to find and manage.

> > Why is Normalization Important?

Normalization is often described in terms of “normal forms” (1NF, 2NF, 3NF, and beyond). While the details can get quite technical, the core ideas are straightforward:

#### 1NF (First Normal Form): `Atomic Values`

**Goal**: Each column should hold a single, indivisible value. No repeating groups of data within a single cell

**Example**: Instead of having a single `address` column that stores `123 Main St, City, USA`, you’d break it down into separate columns: `street_address`, `city`, `state`, `zip_code`.

```sql
-- Unnormalized (violates 1NF)
CREATE TABLE Customers_Unnormalized (
    customer_id INT PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(255) -- Problem: Multiple pieces of info in one column
);

-- Normalized to 1NF
CREATE TABLE Customers_1NF (
    customer_id INT PRIMARY KEY,
    name VARCHAR(255),
    street_address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    zip_code VARCHAR(10)
);
```

#### 2NF (Second Normal Form): `Eliminate Redundant Data Dependent on Part of the Key`

**Goal**: Applies when you have a table with a composite primary key (a primary key made up of two or more columns). 2NF ensures that all non-key attributes are fully dependent on the entire composite primary key, not just part of it.

Imagine we have a table called `order_items`. This table tracks items within orders, and we use a composite primary key (`order_id`, `product_id`) because a single order can have multiple of the same product (though in this simplified example, let’s assume each product appears only once per order for clarity, but the composite key logic still applies).

> > Expand for visual example

**Problem**: Notice that `product_name` and `product_price` are repeated whenever the same `product_id` appears in different orders. These attributes are only dependent on `product_id`, which is part of the composite primary key (`order_id`, `product_id`), but not the entire key. This is a partial dependency.

To achieve 2NF, we need to remove the partially dependent attributes (`product_name`, `product_price`) and place them in a separate table where they are fully dependent on the primary key of that new table.

> > Normalization to 2NF: Visual explanation

#### 3NF (Third Normal Form): `Eliminate Redundant Data Dependent on Non-Key Attributes`

**Goal**: Remove data that is dependent on other non-key attributes. This is about eliminating transitive dependencies.

**Problem**: Let’s say we have a `suppliers` table. We store supplier information, including their `zip_code`, `city`, and `state`. `supplier_id` is the primary key.

> > ```sql
> > CREATE TABLE suppliers (
> >     supplier_id VARCHAR(10) PRIMARY KEY,
> >     supplier_name VARCHAR(255),
> >     zip_code VARCHAR(10),
> >     city VARCHAR(100),
> >     state VARCHAR(50)
> > );
> >
> > INSERT INTO suppliers (supplier_id, supplier_name, zip_code, city, state) VALUES
> > ('S1', 'Acme Corp', '12345', 'Anytown', 'NY'),
> > ('S2', 'Beta Inc', '67890', 'Otherville', 'CA'),
> > ('S3', 'Gamma Ltd', '12345', 'Anytown', 'NY');
> > ``````plaintext
> > +---------------------------------------------------------------+
> > | suppliers                                                     |
> > +---------------------------------------------------------------+
> > | PK supplier_id | supplier_name | zip_code | city      | state |
> > +---------------------------------------------------------------+
> > | S1             | Acme Corp     | 12345    | Anytown    | NY   |
> > | S2             | Beta Inc      | 67890    | Otherville | CA   |
> > | S3             | Gamma Ltd     | 12345    | Anytown    | NY   |
> > +---------------------------------------------------------------+
> > ```

**Solution**: To achieve 3NF, we remove the attributes dependent on the non-key attribute (`city`, `state` dependent on `zip_code`) and put them into a separate table keyed by the non-key attribute itself (`zip_code`).

> > Normalization to 3NF: Visual explanation

> Good to know

> > There are additional normal forms, such as `4NF`, `5NF`, `6NF`, `EKNF`, `ETNF`, and `DKNF`. We won’t cover these here, but we will create a dedicated set of tutorials for them in our guides and tutorials section.

### Database Relationships

#### One-to-One

In a one-to-one relationship, each record in `table A` is related to at most one record in `table B`, and each record in `table B` is related to at most one record in `table A`. It’s a very direct, exclusive pairing.

> > Use Cases & Examples

#### One-to-Many

In a one-to-many relationship, one record in `table A` can be related to many records in `table B`, but each record in `table B` is related to at most one record in `table A`. Think of it as a “parent-child” relationship.

> > Use Cases & Examples

#### Many-to-Many

In a many-to-many relationship, one record in `table A` can be related to many records in `table B`, and one record in `table B` can be related to many records in `table A`. It’s a more complex, bidirectional relationship.

> > Use Cases & Examples

Many-to-many relationships are not directly implemented with foreign keys between the two main tables. Instead, you need a `junction` table (also called an associative table or bridging table). This table acts as an intermediary to link records from both tables.

```sql
-- Table for Students (Many side)
CREATE TABLE students (
    iid INT PRIMARY KEY,
    name VARCHAR(255)
);

-- Table for Courses (Many side)
CREATE TABLE courses (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    credits INT
);

-- Junction Table: Enrollments (Connects Students and Courses - M-M relationship)
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT, -- Optional, but good practice for junction tables
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    -- Composite Foreign Keys (often part of a composite primary key or unique constraint)
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY (student_id, course_id) -- Prevent duplicate enrollments for the same student and course
);
```

### Why Foreign Keys?

You might think of foreign key constraints as simply a way to validate data - ensuring that when you enter a value in a foreign key column, that value actually exists in the primary key column of another table. And you’d be partially right! This value checking is the mechanism foreign keys use.

But it’s crucial to understand that this validation is not the end goal, it’s the means to a much larger purpose. Foreign key constraints are fundamentally about:

> > 1. Explicitly Defining and Enforcing Relationships

> > 2. Maintaining Referential Integrity

> > 3. Facilitating Database Design and Understanding

In essence, foreign key constraints are not just about checking values; they are about:

1. Defining the rules of your data relationships
2. Actively enforcing those rules at the database level
3. Guaranteeing data integrity and consistency within those relationships
4. Making your database more robust, reliable, and understandable

### Why NOT Foreign Keys?

While highly beneficial, there are some scenarios where you might reconsider or use Foreign Keys with caution. These are typically edge cases and often involve trade-offs.

> > 1. Performance Overhead in Very High-Write Environments

> > 2. Distributed Database Systems and Cross-Node Foreign Keys:

> > 3. Legacy Systems and Data Integration with Non-Relational Data:

You can also check out some great explanations from the PlanetScale team in their [article](https://planetscale.com/docs/learn/operating-without-foreign-key-constraints#why-does-planetscale-not-recommend-constraints)

### Polymorphic Relations

Polymorphic relationships are a more advanced concept that allows a single relationship to point to different types of entities or tables. It’s about creating more flexible and adaptable relationships when you have different kinds of data that share some commonality.

Imagine you have an `activities` log. An activity could be a `comment` a `like` or a `share`. Each of these `activity` types has different details. Instead of creating separate tables and relationships for each activity type and the things they relate to, you might use a polymorphic approach.

> > Common Scenarios & Examples

Polymorphic relationships are more complex and are often handled at the application level or using more advanced database features (depending on the specific database system). Standard SQL doesn’t have direct, built-in support for enforcing polymorphic foreign key constraints in the same way as regular foreign keys.