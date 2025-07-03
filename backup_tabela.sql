PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "financial_categories" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  name TEXT,
  type TEXT,
  description TEXT,
  node_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (parent_id) REFERENCES financial_categories(id)
);
INSERT INTO financial_categories VALUES(1,NULL,'entrada','entrada',NULL,'grupo','2025-05-30 16:17:02',NULL);
INSERT INTO financial_categories VALUES(2,NULL,'saída','saída',NULL,'grupo','',NULL);
INSERT INTO financial_categories VALUES(41,1,'Doações','entrada',NULL,'grupo','2025-05-30 12:05:22',NULL);
INSERT INTO financial_categories VALUES(42,41,'ADM','entrada',NULL,'item','2025-05-30 12:05:41',NULL);
INSERT INTO financial_categories VALUES(43,41,'Deidade/Tulasi','entrada',NULL,'item','2025-05-30 12:06:02',NULL);
INSERT INTO financial_categories VALUES(44,41,'Bovinos','entrada',NULL,'item','2025-05-30 12:06:16',NULL);
INSERT INTO financial_categories VALUES(45,41,'Manteiga Deidades','entrada',NULL,'item','2025-05-30 12:06:36',NULL);
INSERT INTO financial_categories VALUES(46,1,'CRM','entrada',NULL,'grupo','2025-05-30 12:07:58',NULL);
INSERT INTO financial_categories VALUES(47,1,'Taxa social','entrada',NULL,'grupo','2025-05-30 12:08:47',NULL);
INSERT INTO financial_categories VALUES(48,1,'Taxa comercial','entrada',NULL,'grupo','2025-05-30 12:09:16',NULL);
INSERT INTO financial_categories VALUES(50,41,'Festival devocional','entrada',NULL,'item','2025-05-30 12:10:49',NULL);
INSERT INTO financial_categories VALUES(51,41,'cuidado Rupa Gouranga das','entrada',NULL,'item','2025-05-30 12:11:28',NULL);
INSERT INTO financial_categories VALUES(53,2,'EDP','saída',NULL,'grupo','2025-05-30 12:16:49',NULL);
INSERT INTO financial_categories VALUES(54,53,'Casa Amarela','saída',NULL,'item','2025-05-30 12:17:20',NULL);
INSERT INTO financial_categories VALUES(55,53,'Templo','saída',NULL,'item','2025-05-30 12:17:44',NULL);
INSERT INTO financial_categories VALUES(56,53,'Coz. Comunitaria','saída',NULL,'item','2025-05-30 12:18:01',NULL);
INSERT INTO financial_categories VALUES(57,2,'Funcionarios','saída',NULL,'grupo','2025-05-30 12:25:46',NULL);
INSERT INTO financial_categories VALUES(67,41,'Diversas','entrada',NULL,'item','2025-06-02 12:31:01',NULL);
INSERT INTO financial_categories VALUES(68,48,'Bistrô','entrada',NULL,'item','2025-06-02 12:37:15',NULL);
INSERT INTO financial_categories VALUES(69,48,'Presentes Inigualáveis','entrada',NULL,'item','2025-06-02 12:38:17',NULL);
INSERT INTO financial_categories VALUES(70,48,'Mandala Mística','entrada',NULL,'item','2025-06-02 12:38:44',NULL);
INSERT INTO financial_categories VALUES(72,48,'Jaya Terapias','entrada',NULL,'item','2025-06-02 12:39:28',NULL);
INSERT INTO financial_categories VALUES(73,48,'Pousada Nova Gokula','entrada',NULL,'item','2025-06-02 12:40:39',NULL);
INSERT INTO financial_categories VALUES(74,48,'Jaganatha','entrada',NULL,'item','2025-06-02 12:40:58',NULL);
INSERT INTO financial_categories VALUES(75,48,'Quiosque Govindaji','entrada','Eka','item','2025-06-02 12:42:28',NULL);
INSERT INTO financial_categories VALUES(76,48,'Quiosque ADM','entrada',NULL,'item','2025-06-02 12:42:46',NULL);
INSERT INTO financial_categories VALUES(77,48,'Quiosque da Yasoda Yasa','entrada',NULL,'item','2025-06-02 12:43:25',NULL);
INSERT INTO financial_categories VALUES(78,48,'Casa dos Gurus','entrada',NULL,'item','2025-06-02 12:43:37',NULL);
INSERT INTO financial_categories VALUES(79,48,'Hospedaria Subhadra','entrada',NULL,'item','2025-06-02 12:44:05',NULL);
INSERT INTO financial_categories VALUES(80,48,'Casa do Udhava','entrada',NULL,'item','2025-06-02 12:44:21',NULL);
INSERT INTO financial_categories VALUES(81,48,'Hospedaria Lotus','entrada',NULL,'item','2025-06-02 12:44:35',NULL);
INSERT INTO financial_categories VALUES(82,48,'Chalé do Bosque','entrada',NULL,'item','2025-06-02 12:44:47',NULL);
INSERT INTO financial_categories VALUES(83,48,'Casa da Katyaiani','entrada',NULL,'item','2025-06-02 12:45:37',NULL);
INSERT INTO financial_categories VALUES(84,48,'Casa Mahalila','entrada',NULL,'item','2025-06-02 12:48:13',NULL);
INSERT INTO financial_categories VALUES(85,48,'Casa Rama Parsua','entrada',NULL,'item','2025-06-02 12:48:53',NULL);
INSERT INTO financial_categories VALUES(86,48,'Casa da Sundari / Hadai','entrada',NULL,'item','2025-06-02 12:49:45',NULL);
INSERT INTO financial_categories VALUES(87,48,'Casa Vrnda','entrada',NULL,'item','2025-06-02 12:51:30',NULL);
INSERT INTO financial_categories VALUES(88,48,'Casa Shashi','entrada',NULL,'item','2025-06-02 12:51:43',NULL);
INSERT INTO financial_categories VALUES(89,48,'Casa Mahanta','entrada',NULL,'item','2025-06-02 12:51:54',NULL);
INSERT INTO financial_categories VALUES(90,48,'Casa Yajna','entrada',NULL,'item','2025-06-02 12:52:10',NULL);
INSERT INTO financial_categories VALUES(91,48,'Casa Vijaya','entrada',NULL,'item','2025-06-02 12:52:22',NULL);
INSERT INTO financial_categories VALUES(92,48,'Mandapa','entrada','Devananda','item','2025-06-02 12:54:50',NULL);
INSERT INTO financial_categories VALUES(93,48,'Casa da Bala','entrada',NULL,'item','2025-06-02 12:56:10',NULL);
INSERT INTO financial_categories VALUES(95,2,'Gerais','saída',NULL,'item','2025-06-04 02:32:39',NULL);
INSERT INTO financial_categories VALUES(96,2,'Cuidados aos Bovinos','saída',NULL,'item','2025-06-04 12:46:23',NULL);
INSERT INTO financial_categories VALUES(97,2,'Jaganatha - Lanchonete','saída',NULL,'item','2025-06-04 13:10:09',NULL);
INSERT INTO financial_categories VALUES(98,2,'Deidades','saída','Jaganatha',NULL,'2025-06-04 13:14:17',NULL);
INSERT INTO financial_categories VALUES(99,41,'Materiais','entrada',NULL,'item','2025-06-04 13:37:07',NULL);
INSERT INTO financial_categories VALUES(101,2,'Estorno','saída',NULL,'item','2025-06-04 13:39:53',NULL);
INSERT INTO financial_categories VALUES(103,1,'Portaria','entrada',NULL,'item','2025-06-07 18:07:20',NULL);
INSERT INTO financial_categories VALUES(104,41,'Tratamento mãe Maha','entrada',NULL,'item','2025-06-07 18:10:17',NULL);
INSERT INTO financial_categories VALUES(105,2,'Holi Fest','saída',NULL,'item','2025-06-07 18:48:30',NULL);
INSERT INTO financial_categories VALUES(106,2,'Kirtan Fest','saída',NULL,NULL,'2025-06-07 18:49:22',NULL);
INSERT INTO financial_categories VALUES(107,2,'Equipamentos','saída',NULL,'item','2025-06-07 18:57:50',NULL);
INSERT INTO financial_categories VALUES(108,2,'Pagamento de Empréstimo','saída',NULL,'item','2025-06-07 19:11:50',NULL);
INSERT INTO financial_categories VALUES(109,2,'Pujaris','saída',NULL,'grupo','2025-06-07 19:29:15',NULL);
INSERT INTO financial_categories VALUES(110,109,'Mãe Ganga / Divauka','saída',NULL,'item','2025-06-07 19:29:40',NULL);
COMMIT;
