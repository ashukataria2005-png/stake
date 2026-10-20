-- ==============================================================================
-- Stake Casino - Single Unified MySQL Production Schema
-- Compatible with cPanel phpMyAdmin (MySQL 5.7+ / 8.0+, MariaDB 10.2+)
-- Storage Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ------------------------------------------------------------------------------
-- 1. Table structure for table: `users`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  `isBanned` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_created_at_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table structure for table: `admin_users`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
  `permissions` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_username_unique` (`username`),
  UNIQUE KEY `admin_users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table structure for table: `wallets`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `balance` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `totalDeposited` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
  `totalWithdrawn` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
  `totalWagered` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
  `approvedDepositCount` INT NOT NULL DEFAULT 0,
  `unlockedBonusTier` INT NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_userId_unique` (`userId`),
  KEY `wallets_currency_idx` (`currency`),
  CONSTRAINT `fk_wallets_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table structure for table: `deposits`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `deposits`;
CREATE TABLE `deposits` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `order_sn` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(18, 4) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `method` VARCHAR(50) NOT NULL DEFAULT 'RUPAYEX',
  `utr` VARCHAR(191) NULL,
  `remark` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `deposits_order_sn_unique` (`order_sn`),
  KEY `deposits_userId_idx` (`userId`),
  KEY `deposits_status_idx` (`status`),
  KEY `deposits_utr_idx` (`utr`),
  KEY `deposits_createdAt_idx` (`createdAt`),
  CONSTRAINT `fk_deposits_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table structure for table: `withdrawals`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `withdrawals`;
CREATE TABLE `withdrawals` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(18, 4) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `payoutMethod` VARCHAR(50) NOT NULL DEFAULT 'UPI',
  `accountDetails` TEXT NULL,
  `remark` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `withdrawals_userId_idx` (`userId`),
  KEY `withdrawals_status_idx` (`status`),
  KEY `withdrawals_createdAt_idx` (`createdAt`),
  CONSTRAINT `fk_withdrawals_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table structure for table: `game_history` (bets)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `game_history`;
CREATE TABLE `game_history` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `gameId` VARCHAR(50) NOT NULL,
  `wager` DECIMAL(18, 4) NOT NULL,
  `payout` DECIMAL(18, 4) NOT NULL,
  `multiplier` DECIMAL(10, 2) NOT NULL,
  `isWin` BOOLEAN NOT NULL,
  `gameData` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_game_history_userId` (`userId`),
  KEY `idx_game_history_gameId` (`gameId`),
  KEY `idx_game_history_createdAt` (`createdAt`),
  KEY `idx_game_history_user_game` (`userId`, `gameId`, `createdAt`),
  CONSTRAINT `fk_game_history_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table structure for table: `system_settings`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `description` TEXT NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- PRE-SEEDED PRODUCTION & DEFAULT DATA
-- ==============================================================================

-- 1. Pre-seed Default Super Admin
-- Username: admin | Password: admin123 (Supports plain text & scrypt hash)
INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `role`, `permissions`, `createdAt`)
VALUES (
  'admin_super_01',
  'admin',
  'admin@stake.internal',
  'admin123',
  'SUPER_ADMIN',
  '["ALL", "DASHBOARD", "USERS", "FINANCE", "GAMES", "SETTINGS", "WITHDRAWALS", "DEPOSITS", "LUCK_CONTROL"]',
  NOW(3)
)
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- 2. Pre-seed Default Player & Wallet
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `isBanned`, `createdAt`, `updatedAt`)
VALUES (
  'usr_default_player',
  'demo_player',
  'player@stake.internal',
  'player123',
  'USER',
  FALSE,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

INSERT INTO `wallets` (`id`, `userId`, `balance`, `currency`, `totalDeposited`, `totalWithdrawn`, `totalWagered`, `approvedDepositCount`, `unlockedBonusTier`, `createdAt`, `updatedAt`)
VALUES (
  'wal_default_player',
  'usr_default_player',
  0.0000,
  'INR',
  0.0000,
  0.0000,
  0.0000,
  0,
  1,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- 3. Pre-seed System Settings
INSERT INTO `system_settings` (`id`, `key`, `value`, `description`, `updatedAt`)
VALUES
(
  'setting_system_upi',
  'SYSTEM_UPI',
  '{"gatewayMode":"LGPAY_AUTO","paymentChannel":"RUPAYEX","upiId":"stakeofficial@upi","upiName":"Stake Gaming","lgpayMerchantId":"stake_lgpay_merchant","lgpayApiKey":"lgpay_secret_key_prod_8829","lgpayBaseUrl":"https://www.lg-pay.com","tradeType":"INRUPI","amountUnit":"PAISE","minDepositAmount":100,"minWithdrawalAmount":500,"quickAmounts":[300,500,1000,5000,10000,25000]}',
  'Payment gateway configuration for UPI, RupayEx and LG-Pay integration',
  NOW(3)
),
(
  'setting_limits',
  'LIMITS',
  '{"minDepositAmount":100,"minWithdrawalAmount":500,"maxDailyWithdrawal":100000,"quickAmounts":[300,500,1000,5000,10000,25000]}',
  'Platform global deposit, withdrawal, and quick chip presets',
  NOW(3)
),
(
  'setting_gateway_rupayex',
  'GATEWAY_RUPAYEX',
  '{"channel":"RUPAYEX","merchantCode":"RUPAYEX_STAKE","apiUrl":"https://api.rupayex.com/v1/order/create","webhookUrl":"/api/payment/webhook","status":"ACTIVE"}',
  'RupayEx direct merchant gateway credentials and webhook endpoint',
  NOW(3)
),
(
  'setting_platform_info',
  'PLATFORM_INFO',
  '{"platformName":"Stake Casino","supportEmail":"support@stake.internal","baseCurrency":"INR","liveChatEnabled":true}',
  'General platform metadata and branding settings',
  NOW(3)
)
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
