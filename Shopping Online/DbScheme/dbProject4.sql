CREATE DATABASE  IF NOT EXISTS `jbh_4th_project` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `jbh_4th_project`;
-- MySQL dump 10.13  Distrib 8.0.20, for Win64 (x86_64)
--
-- Host: localhost    Database: jbh_4th_project
-- ------------------------------------------------------
-- Server version	8.0.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_products`
--

DROP TABLE IF EXISTS `cart_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_products` (
  `cart_product_id` int NOT NULL AUTO_INCREMENT,
  `cart_id_fk` int NOT NULL,
  `product_id_fk` int NOT NULL,
  `units` int NOT NULL,
  `sum_price` int NOT NULL,
  PRIMARY KEY (`cart_product_id`),
  KEY `product_id_fk` (`product_id_fk`),
  KEY `cart_id_fk` (`cart_id_fk`),
  CONSTRAINT `cart_products_ibfk_1` FOREIGN KEY (`product_id_fk`) REFERENCES `products` (`id`),
  CONSTRAINT `cart_products_ibfk_2` FOREIGN KEY (`cart_id_fk`) REFERENCES `carts` (`cart_id`)
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_products`
--

LOCK TABLES `cart_products` WRITE;
/*!40000 ALTER TABLE `cart_products` DISABLE KEYS */;
INSERT INTO `cart_products` VALUES (99,24,1,2,4),(100,24,13,1,11),(101,24,6,1,12),(102,24,19,1,18),(103,25,15,3,36),(104,25,14,1,23),(105,26,3,3,6),(106,26,5,2,12),(107,26,21,1,34),(108,26,17,1,6),(112,27,7,1,2),(113,27,8,1,20),(121,29,6,1,12),(122,30,4,4,8),(133,28,1,2,4),(134,28,2,2,14),(135,28,3,3,6),(136,28,8,1,20),(137,28,21,1,34),(138,31,1,2,4),(139,31,3,3,6),(140,31,13,1,11),(141,31,18,4,8),(142,31,21,1,34),(143,32,1,2,4),(144,32,13,1,11),(145,32,5,1,6),(146,32,7,4,8),(147,32,18,2,4),(148,33,2,1,7),(149,34,3,1,2),(151,35,3,2,4),(152,35,1,2,4),(153,35,13,1,11),(154,35,19,1,18),(155,35,20,1,3);
/*!40000 ALTER TABLE `cart_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id_fk` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `time_created_cart` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_updated_cart` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `user_id_fk` (`user_id_fk`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id_fk`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (24,222,0,'2020-11-19 10:06:09','2020-11-19 10:08:22'),(25,333,0,'2020-11-19 10:08:57','2020-11-19 10:10:03'),(26,222,0,'2020-11-19 10:10:29','2020-11-19 10:12:04'),(27,333,0,'2020-11-19 10:12:16','2020-11-19 10:13:34'),(28,222,0,'2020-11-19 10:14:42','2020-11-20 10:54:53'),(29,333,0,'2020-11-19 10:29:08','2020-11-19 10:29:51'),(30,333,0,'2020-11-19 10:36:02','2020-11-19 10:36:31'),(31,222,0,'2020-11-20 10:55:40','2020-11-20 11:20:23'),(32,222,0,'2020-11-20 11:20:37','2020-11-20 11:51:35'),(33,333,0,'2020-11-20 11:21:10','2020-11-20 11:21:48'),(34,222,0,'2020-11-20 12:09:19','2020-11-20 12:10:29'),(35,222,1,'2020-11-20 12:17:51','2020-11-20 12:17:51');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` char(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Dairy and Eggs'),(2,'Vegetables and Fruits'),(3,'Meat and Fish'),(4,'Beverages');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_user_id_fk` int NOT NULL,
  `order_cart_id_fk` int NOT NULL,
  `total_price` int NOT NULL,
  `order_city` char(100) NOT NULL,
  `order_street` char(100) NOT NULL,
  `shipping_date` date NOT NULL,
  `time_created_order` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `order_user_id_fk` (`order_user_id_fk`),
  KEY `order_cart_id_fk` (`order_cart_id_fk`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`order_user_id_fk`) REFERENCES `users` (`user_id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`order_cart_id_fk`) REFERENCES `carts` (`cart_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (34,222,24,45,'Tel aviv','dafna','2020-12-28','2020-11-19 10:08:22'),(35,333,25,59,'Jerusalem','ccc','2020-12-28','2020-11-19 10:10:03'),(36,222,26,58,'Tel aviv','bbb','2020-12-28','2020-11-19 10:12:04'),(37,333,27,22,'Jerusalem','ccc','2020-12-31','2020-11-19 10:13:34'),(38,333,29,12,'Jerusalem','ccc','2020-12-31','2020-11-19 10:29:51'),(39,333,30,8,'Jerusalem','ccc','2020-12-31','2020-11-19 10:36:31'),(40,222,28,78,'Tel aviv','dafna','2021-01-13','2020-11-20 10:54:53'),(41,222,31,63,'Tel aviv','dafna','2021-01-13','2020-11-20 11:20:23'),(42,333,33,7,'Jerusalem','ccc','2021-01-13','2020-11-20 11:21:48'),(43,222,32,33,'Tel aviv','dafna','2021-01-01','2020-11-20 11:51:35'),(44,222,34,2,'Natanya','eeeeee','2021-01-01','2020-11-20 12:10:29');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_name` char(100) NOT NULL,
  `category_id` int NOT NULL,
  `price` int NOT NULL,
  `image` char(100) NOT NULL,
  `time_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Milk',1,2,'milk.jpg','2020-11-04 18:04:40'),(2,'12 Eggs pack',1,7,'eggs.jpg','2020-11-11 08:14:08'),(3,'Tomato',2,2,'tomato.jpg','2020-11-04 18:04:40'),(4,'Apple',2,2,'apple.jpg','2020-11-04 18:04:40'),(5,'Chicken',3,6,'chicken.jpg','2020-11-04 18:04:40'),(6,'Salmon',3,12,'salmon.jpg','2020-11-04 18:04:40'),(7,'Coca Cola',4,2,'cola.jpg','2020-11-19 16:21:31'),(8,'Red wine',4,20,'redWine.jpg','2020-11-04 18:04:40'),(13,'Free-range eggs',1,11,'dbd6d49b-e061-4255-a3ea-81a9efe30d78.jpg','2020-11-19 09:52:55'),(14,'Vodka',4,23,'f7fa69bb-a299-419e-b045-c6211c26373b.jpg','2020-11-19 09:53:55'),(15,'Yogurt',1,12,'acb3d424-7e64-43ad-8c7b-e16d78031d42.jpg','2020-11-19 09:53:17'),(17,'Humus',2,6,'fcc98b5e-6145-4f56-a670-20506fe1ef09.jpg','2020-11-17 18:58:15'),(18,'Cucumber',2,2,'81e6d698-1336-4830-bfad-9e4d5ab3cef5.jpg','2020-11-19 09:55:18'),(19,'Arak Ayalim',4,18,'6b80c90d-7eba-4294-b7d4-f65d2159dfc4.jpeg','2020-11-19 09:56:18'),(20,'Tilapia',3,3,'1df28689-b911-4a57-9568-87177fc3ad75.jpg','2020-11-19 09:57:44'),(21,'Rib eye steak',3,34,'c076d057-24e1-40dd-b903-a8131e8f29f6.jpg','2020-11-19 11:44:37');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `first_name` char(100) NOT NULL,
  `last_name` char(100) NOT NULL,
  `email` char(150) NOT NULL,
  `password` char(100) NOT NULL,
  `city` char(100) DEFAULT NULL,
  `street` char(100) DEFAULT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (111,'ad','min','a@a.a','$2b$10$hShdNJYdmbWH3CtnUENlV.IE1NsbY666C4hRAHjSc6bM4BYrX1zC6','','',1),(222,'b','b','b@b.b','$2b$10$zGpaXAzJrrTy.fXImPrutOGMRfZgwuBphHCvcmjead5jn8WXppPkK','Tel aviv','dafna',0),(333,'c','c','c@c.c','$2b$10$rRofvfLdwEZ0Kq3Oei6rf.DdIwci2SB9qfz2yvwZRizjylfo8mIAe','Jerusalem','ccc',0),(444,'d','dd','d@d.d','$2b$10$OZnwQwyqSUWVcmHM3LhlduQibEKKp/W5yp7W.ZXnai8ep1HuReBn6','Haifa','dd-drive',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-20 14:22:32
