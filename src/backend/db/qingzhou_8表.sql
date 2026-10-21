-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: qingzhou_mall
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `qingzhou_mall`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `qingzhou_mall` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `qingzhou_mall`;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '所属用户编号',
  `receiver_name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) NOT NULL COMMENT '收货人手机号',
  `region` varchar(100) DEFAULT NULL COMMENT '所在地区(省/市/区)',
  `detail` varchar(255) NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认地址:0否1是',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_address_user` (`user_id`) USING BTREE,
  CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='收货地址表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,2,'演示用户','13800000002','湖南省长沙市','岳麓区测试路2号',1,'2026-10-08 00:12:08','2026-10-08 00:12:26');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '所属用户编号',
  `product_id` int NOT NULL COMMENT '商品编号',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '购买数量',
  `selected` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否勾选结算:0否1是',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_cart_user_product` (`user_id`,`product_id`) USING BTREE,
  KEY `idx_cart_product` (`product_id`) USING BTREE,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='购物车表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,2,1,1,1,'2026-10-08 00:24:42','2026-10-08 00:24:42');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序值(越小越靠前)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_category_name` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='商品分类表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'数码产品',1,'2026-09-20 09:56:04','2026-09-20 09:56:04'),(2,'家电类',2,'2026-09-20 09:56:04','2026-09-20 09:56:04'),(3,'软件类',3,'2026-09-20 09:56:04','2026-09-20 09:56:04'),(4,'图书文具',4,'2026-09-20 09:56:04','2026-09-20 09:56:04'),(5,'童装',5,'2026-09-20 09:56:04','2026-09-20 09:56:04'),(6,'水果类',6,'2026-09-20 09:56:04','2026-09-20 09:56:04'),(7,'生鲜蔬菜',7,'2026-09-20 09:56:04','2026-09-20 09:56:04'),(8,'零食类',8,'2026-09-20 09:56:04','2026-09-20 09:56:04');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户编号',
  `product_id` int NOT NULL COMMENT '商品编号',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_fav_user_product` (`user_id`,`product_id`) USING BTREE,
  KEY `idx_fav_product` (`product_id`) USING BTREE,
  CONSTRAINT `fk_fav_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='商品收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (1,2,1,'2026-10-07 07:46:47');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT '所属订单编号',
  `product_id` int NOT NULL COMMENT '商品编号',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称快照',
  `product_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品图片快照',
  `price` decimal(10,2) NOT NULL COMMENT '下单时单价(元)',
  `quantity` int NOT NULL COMMENT '购买数量',
  `subtotal` decimal(10,2) NOT NULL COMMENT '小计金额(元)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_order_id` (`order_id`) USING BTREE,
  KEY `idx_product_id` (`product_id`) USING BTREE,
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'海南葡萄7大果','葡萄.png',97.50,2,195.00,'2026-09-09 01:10:01'),(2,1,8,'联想Thinkbook笔记本','products/联想Thinkbook.png',5999.00,1,5999.00,'2026-09-09 01:10:01'),(3,2,6,'赣南脐橙','products/chengzi1.jpg',28.50,3,85.50,'2026-09-09 01:10:31'),(4,3,2,'山东烟台红富士苹果','苹果.png',73.50,1,73.50,'2026-09-09 01:10:54'),(42,36,1,'海南葡萄7大果','葡萄.png',97.50,2,195.00,'2026-10-07 07:48:44'),(43,40,2,'山东烟台红富士苹果','苹果.png',73.50,1,73.50,'2026-10-07 08:06:07'),(44,41,2,'山东烟台红富士苹果','苹果.png',73.50,1,73.50,'2026-10-08 00:22:14');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '订单编号',
  `user_id` int NOT NULL COMMENT '下单用户编号',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额(元)',
  `points_used` int NOT NULL DEFAULT '0' COMMENT '使用积分数量',
  `points_discount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '积分抵扣金额(元)',
  `final_amount` decimal(10,2) NOT NULL COMMENT '实付金额(元)',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '已下单' COMMENT '订单状态:已下单/已付款/已发货/已完成/已取消',
  `payment_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'alipay' COMMENT '支付方式:wechat/alipay/wallet',
  `contact_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '收货人姓名',
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '收货人电话',
  `contact_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '收货地址',
  `address_id` int DEFAULT NULL COMMENT '所选收货地址编号',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '订单备注',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `order_no` (`order_no`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_order_address` (`address_id`),
  CONSTRAINT `fk_order_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'O20260909201599346',2,6194.00,14,0.14,6193.86,'已发货','alipay','演示用户','13800000002','湖南省长沙市岳麓区测试路2号',NULL,NULL,'2026-09-09 01:10:01','2026-09-09 01:19:39'),(2,'O20260909231914819',2,85.50,0,0.00,85.50,'已下单','wechat','演示用户','13800000002','湖南省长沙市岳麓区测试路2号',NULL,'请尽快发货','2026-09-09 01:10:31','2026-09-09 01:10:31'),(3,'O20260909254556257',2,73.50,0,0.00,73.50,'已下单','alipay','演示用户','13800000002','湖南省长沙市岳麓区测试路2号',NULL,NULL,'2026-09-09 01:10:54','2026-09-09 01:10:54'),(36,'O202610072B344F79',2,195.00,0,0.00,195.00,'已完成','wallet','演示用户','13800000002','湖南省长沙市岳麓区测试路2号',NULL,NULL,'2026-10-07 07:48:44','2026-10-07 08:02:35'),(40,'O20261007400D0580',2,73.50,0,0.00,73.50,'已取消','wallet','演示用户','13800000002','湖南省长沙市岳麓区测试路2号',NULL,NULL,'2026-10-07 08:06:07','2026-10-07 08:06:07'),(41,'O202610084A9AD4FE',2,73.50,0,0.00,73.50,'已付款','wechat','演示用户','13800000002','湖南省长沙市岳麓区测试路2号',NULL,NULL,'2026-10-08 00:22:14','2026-10-08 00:23:09');
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称',
  `meta` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品卖点/简短描述',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '商品详情描述',
  `price` decimal(10,2) NOT NULL COMMENT '商城售价(元)',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '市场价/原价(元)',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品图片路径(相对src/images)',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品分类',
  `category_id` int DEFAULT NULL COMMENT '所属分类编号',
  `stock` int NOT NULL DEFAULT '999' COMMENT '库存数量',
  `sales` int NOT NULL DEFAULT '0' COMMENT '累计销量',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_category` (`category`) USING BTREE,
  KEY `idx_name` (`name`) USING BTREE,
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'海南葡萄7大果','新鲜水果，产地直发',NULL,97.50,130.00,'葡萄.png','水果类',6,994,8,'2026-09-09 01:07:06','2026-10-07 07:48:44'),(2,'山东烟台红富士苹果','16-24个 5KG 新鲜水果',NULL,73.50,98.00,'苹果.png','水果类',6,995,4,'2026-09-09 01:07:06','2026-10-08 00:22:14'),(3,'密云当地新鲜白萝卜','约500g新鲜蔬菜',NULL,8.50,12.00,'密云当地新鲜白萝卜.png','生鲜蔬菜',7,998,1,'2026-09-09 01:07:06','2026-09-20 13:25:38'),(4,'新鲜梨子','清脆多汁，甜脆爽口',NULL,15.80,22.00,'products/lizi.jpg','水果类',6,999,0,'2026-09-09 01:07:06','2026-09-20 11:12:58'),(5,'美味汉堡','牛肉汉堡套餐',NULL,29.90,39.90,'products/hanbao.jpg','零食类',8,998,1,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(6,'赣南脐橙','新鲜橙子，酸甜可口',NULL,28.50,38.00,'products/chengzi1.jpg','水果类',6,994,5,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(7,'牛油果','新鲜牛油果，营养丰富',NULL,12.80,18.00,'products/niuyouguo1.jpg','水果类',6,998,1,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(8,'联想Thinkbook笔记本','轻薄便携，办公首选',NULL,5999.00,6999.00,'products/联想Thinkbook.png','数码产品',1,49,1,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(9,'iPhone14 Pro Max','旗舰级智能手机',NULL,8999.00,9999.00,'products/iPhone14ProMax.png','数码产品',1,30,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(10,'iPhone Air','轻薄时尚，性能强劲',NULL,5499.00,6299.00,'products/iPhoneAir.png','数码产品',1,40,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(11,'ROG枪神9游戏本','电竞级游戏体验',NULL,12999.00,14999.00,'products/ROG枪神9.png','数码产品',1,20,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(12,'儿童纯棉连衣裙','纯棉面料，舒适透气',NULL,129.00,199.00,'products/童装1.png','童装',5,200,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(13,'男童运动套装','时尚运动，活力四射',NULL,159.00,239.00,'products/童装2.png','童装',5,200,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(14,'女童公主裙','精美设计，梦幻可爱',NULL,189.00,289.00,'products/童装3.png','童装',5,200,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(15,'菲斯曼A1JE锅炉壁挂炉','德国品质，高效节能',NULL,10999.00,12999.00,'products/菲斯曼A1JE锅炉壁挂炉.png','家电类',2,15,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(16,'石头扫地机器人P20 Max','扫拖一体，智能避障',NULL,4299.00,4999.00,'products/石头扫地机器人P20 Max.png','家电类',2,60,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(17,'松下家用熨烫蒸汽机','强劲蒸汽，快速除皱',NULL,2499.00,2999.00,'products/松下家用熨烫汽烫机.png','家电类',2,80,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(18,'AO史密斯燃气壁挂炉','美国品牌，安全可靠',NULL,8499.00,9999.00,'products/AO史密斯燃气壁挂炉.png','家电类',2,15,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(19,'Office 365 专业版','办公软件全家桶',NULL,399.00,499.00,'products/软件类1.png','软件类',3,999,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(20,'Photoshop 2024','专业图像处理软件',NULL,699.00,899.00,'products/软件类2.png','软件类',3,999,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(21,'AutoCAD 2024','专业绘图设计软件',NULL,1999.00,2499.00,'products/软件类3.png','软件类',3,999,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(22,'Python编程从入门到精通','零基础学Python',NULL,59.00,79.00,'products/图书1.png','图书文具',4,300,0,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(23,'精装笔记本套装','高品质商务笔记本',NULL,89.00,129.00,'products/图书2.png','图书文具',4,299,1,'2026-09-09 01:07:06','2026-09-20 09:56:04'),(24,'书法毛笔套装','文房四宝精品套装',NULL,159.00,199.00,'products/图书三.png','图书文具',4,300,0,'2026-09-09 01:07:06','2026-09-20 09:56:04');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user' COMMENT '用户角色:user/admin',
  `points` int NOT NULL DEFAULT '0' COMMENT '用户积分余额',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '账户余额(元)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','管理员','$2b$10$Nhc2ONsX4toJxvRTskQSzeGyOdAadUW2xTcPx4SOpaTBqVcWh2N.C','13800000001','admin@qingzhou-mall.com','admin',0,0.00,'2026-05-13 01:57:13','2026-05-13 01:57:13'),(2,'demo_user','演示用户','$2b$10$aquZacGZxF5NaQQz3N9D0e28zL.Zyu59Nnma468TAJgx8ymVgzF5y','13800000002','demo@qingzhou-mall.com','user',0,805.00,'2026-05-13 02:45:51','2026-05-13 02:45:51');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'qingzhou_mall'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08  8:28:38
