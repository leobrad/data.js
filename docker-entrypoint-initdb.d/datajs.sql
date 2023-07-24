-- Adminer 4.8.1 MySQL 8.0.32 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint NOT NULL,
  `name` text,
  `age` int DEFAULT NULL,
  `gender` int DEFAULT NULL,
  `city` text,
  `country` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `user` (`id`, `name`, `age`, `gender`, `city`, `country`) VALUES
(1,	'james',	21,	1,	'sitka',	'america'),
(2,	'ovlier',	22,	1,	'clifton',	'america'),
(3,	'thomas',	23,	1,	'florence',	'america'),
(4,	'david',	32,	1,	'walpi',	'america'),
(5,	'joseph',	23,	1,	'winslow',	'america'),
(6,	'william',	33,	1,	'helena',	'america'),
(7,	'michael',	53,	1,	'morrilton',	'america'),
(8,	'george',	23,	1,	'arcadia',	'america'),
(9,	'alexander',	25,	1,	'coronado',	'america'),
(10,	'john',	25,	1,	'eureka',	'america'),
(11,	'taylor',	23,	0,	'fairfield',	'america'),
(12,	'emily',	23,	0,	'fremont',	'america'),
(13,	'emma',	23,	0,	'fullerton',	'america'),
(14,	'particia',	24,	1,	'irvine',	'america'),
(15,	'elizebeth',	52,	1,	'lompoc',	'america');

-- 2023-07-24 13:55:28
