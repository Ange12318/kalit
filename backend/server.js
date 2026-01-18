const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Créer un pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'base_qualite',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tester la connexion
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur connexion MySQL:', err);
    process.exit(1);
  }
  console.log('Connecté à MySQL - base_qualite');
  connection.release();
});

// === Toutes les routes GET ===
app.get('/api/exportateurs', (req, res) => {
  pool.query("SELECT ID_EXPORTATEUR as id, RAISONSOCIALE_EXPORTATEUR as nom, MARQUE_EXPORTATEUR as marque FROM exportateurs ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur exportateurs:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

app.get('/api/produits', (req, res) => {
  pool.query("SELECT ID_PRODUIT as id, LIBELLE_PRODUIT as nom FROM produits ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur produits:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

app.get('/api/campagnes', (req, res) => {
  pool.query("SELECT CAMP_DEMANDE as nom FROM campagne ORDER BY CAMP_DEMANDE DESC", (err, results) => {
    if (err) {
      console.error("Erreur campagnes:", err);
      return res.json([]);
    }
    res.json(results ? results.map(r => ({ nom: r.nom })) : []);
  });
});

app.get('/api/magasins', (req, res) => {
  pool.query("SELECT ID_MAGASIN as id, NOM_MAGASIN as nom FROM magasins ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur magasins:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route pour récupérer les marques
app.get('/api/marques', (req, res) => {
  pool.query("SELECT ID_MARQUE as id, LIBELLE_MARQUE as nom FROM marques ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur marques:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route pour récupérer les utilisateurs (pour le sondage)
app.get('/api/utilisateurs', (req, res) => {
  pool.query(`
    SELECT 
      u.ID_UTILISATEURS as id,
      u.NOM_UTILISATEURS as nom,
      u.CONTACT_UTILISATEURS as contact,
      u.LOGIN_UTILISATEURS as login,
      f.LIBELLE_FONCTIONS as fonction
    FROM utilisateurs u
    LEFT JOIN fonctions f ON u.ID_FONCTIONS = f.ID_FONCTIONS
    WHERE f.LIBELLE_FONCTIONS = 'SONDEUR' OR u.ID_FONCTIONS = 10
    ORDER BY u.NOM_UTILISATEURS
  `, (err, results) => {
    if (err) {
      console.error("Erreur utilisateurs:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route grades
app.get('/api/grades', (req, res) => {
  pool.query(
    "SELECT ID_GRADES as id, LIBELLE_GRADES as nom, CATEGORIE as categorie FROM grades ORDER BY nom",
    (err, results) => {
      if (err) {
        console.error("Erreur grades:", err);
        return res.json([]);
      }
      res.json(results || []);
    }
  );
});

// === ROUTE POUR LES POSTES DE CONTRÔLE ===
app.get('/api/postes-controle', (req, res) => {
  pool.query(`
    SELECT 
      CODE_POSTE_CONTROLE as code,
      VILLE_POSTE_CONTROLE as ville,
      LIBELLE_POSTE_CONTROLE as libelle,
      RESPONSBLE_POSTE_CONTROLE as responsable,
      ETAT_POSTE_CONTROLE as etat
    FROM poste_controle 
    ORDER BY VILLE_POSTE_CONTROLE
  `, (err, results) => {
    if (err) {
      console.error("Erreur postes controle:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
}); 

// ===============================================
// NOUVELLE ROUTE : Valider un code secret
// ===============================================
app.get('/api/codes-secrets/valider/:code', (req, res) => {
  const { code } = req.params;
  
  pool.query(`
    SELECT 
      rc.ID_CODIFICATION,
      rc.CODE_SECRET_CODIFICATION,
      rc.LIBELLE_CODIFICATION,
      l.ID_LOTS,
      l.NUM_LOTS,
      d.REF_DEMANDE,
      p.ID_PRODUIT,
      p.LIBELLE_PRODUIT,
      e.RAISONSOCIALE_EXPORTATEUR,
      l.RECOLTE_LOTS,
      mg.NOM_MAGASIN
    FROM registre_codification rc
    JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    JOIN lots l ON rs.ID_LOT = l.ID_LOTS
    JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    LEFT JOIN magasins mg ON l.ID_ENTREPOT = mg.ID_MAGASIN
    WHERE rc.CODE_SECRET_CODIFICATION = ?
    LIMIT 1
  `, [code], (err, results) => {
    if (err) {
      console.error("Erreur validation code:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Code secret invalide' });
    }
    
    res.json(results[0]);
  });
});

// ===============================================
// ROUTE : Enregistrer analyse CACAO (CORRIGÉE)
// ===============================================
app.post('/api/analyses/cacao', (req, res) => {
  const {
    idCodification,
    
    // Formation générale
    poidsDeclaration,
    poidsEchantillon,
    poidsTotalEchantillon,
    
    // Première partie - Tableau des analyses
    fevesEntieres,
    fevesPlates,
    poidsDechet,
    poidsFevesPlates,
    poidsFevesEntieres,
    
    // Épreuve à la loupe
    poidsBrisures,
    poidsEtrangeres,
    poidsFevesBrisees,
    poidsCoques,
    poidsCrabot,
    
    // Détermination du grainage
    totalFevesEntieres,
    grainage,
    poidsNombreFevesEntieres,
    
    // Taux d'humidité
    lectureHumidite1,
    lectureHumidite2,
    lectureHumidite3,
    tauxHumiditePourcentage,
    
    // Classification
    normeIvoirienne,
    normeInternationale,
    conforme,
    remarque,
    
    // Défauts
    moisiePlateau1,
    moisiePlateau2,
    moisiePlateau3,
    
    miteePlateau1,
    miteePlateau2,
    miteePlateau3,
    
    ardoiseePlateau1,
    ardoiseePlateau2,
    ardoiseePlateau3,
    
    platePlateau1,
    platePlateau2,
    platePlateau3,
    
    germeePlateau1,
    germeePlateau2,
    germeePlateau3,
    
    violettePlateau1,
    violettePlateau2,
    violettePlateau3,
    
    nbreFevesDefauts,
    
    analyseurId
  } = req.body;
  
  console.log('Données reçues pour analyse cacao');
  
  // Fonction de calcul pour les défauts
  const calculerTotalDefaut = (p1, p2, p3) => {
    const val1 = parseFloat(p1) || 0;
    const val2 = parseFloat(p2) || 0;
    const val3 = parseFloat(p3) || 0;
    return (val1 + val2 + val3).toFixed(3);
  };
  
  // Fonction de calcul pour les pourcentages
  const calculerPourcentage = (total, nbreFeves) => {
    const totalNum = parseFloat(total) || 0;
    const nbreFevesNum = parseFloat(nbreFeves) || 0;
    if (nbreFevesNum === 0) return '0.000';
    return ((totalNum / nbreFevesNum) * 100).toFixed(3);
  };
  
  // Calculer les totaux et pourcentages
  const totalMoisie = calculerTotalDefaut(moisiePlateau1, moisiePlateau2, moisiePlateau3);
  const pourcentageMoisie = calculerPourcentage(totalMoisie, nbreFevesDefauts);
  
  const totalMitee = calculerTotalDefaut(miteePlateau1, miteePlateau2, miteePlateau3);
  const pourcentageMitee = calculerPourcentage(totalMitee, nbreFevesDefauts);
  
  const totalArdoisee = calculerTotalDefaut(ardoiseePlateau1, ardoiseePlateau2, ardoiseePlateau3);
  const pourcentageArdoisee = calculerPourcentage(totalArdoisee, nbreFevesDefauts);
  
  const totalPlate = calculerTotalDefaut(platePlateau1, platePlateau2, platePlateau3);
  const pourcentagePlate = calculerPourcentage(totalPlate, nbreFevesDefauts);
  
  const totalGermee = calculerTotalDefaut(germeePlateau1, germeePlateau2, germeePlateau3);
  const pourcentageGermee = calculerPourcentage(totalGermee, nbreFevesDefauts);
  
  const totalViolette = calculerTotalDefaut(violettePlateau1, violettePlateau2, violettePlateau3);
  const pourcentageViolette = calculerPourcentage(totalViolette, nbreFevesDefauts);
  
  // Calculer le total de l'épreuve à la loupe (sans coques)
  const totalLoupe = (
    (parseFloat(poidsBrisures) || 0) +
    (parseFloat(poidsEtrangeres) || 0) +
    (parseFloat(poidsFevesBrisees) || 0) +
    (parseFloat(poidsCrabot) || 0)
  ).toFixed(3);
  
  // Calculer le total humidité
  const totalHumidite = (
    (parseFloat(lectureHumidite1) || 0) +
    (parseFloat(lectureHumidite2) || 0) +
    (parseFloat(lectureHumidite3) || 0)
  ).toFixed(3);
  
  const utilisateurAnalyseur = analyseurId || 7;
  
  const remarqueEtendue = poidsNombreFevesEntieres 
    ? `${remarque || ''} | Poids Nb Fèves: ${poidsNombreFevesEntieres}`.trim()
    : remarque || '';
  
  // Vérifier si la colonne POIDS_NOMBRE_FEVES_ENTIERES existe
  const sqlVerification = "SHOW COLUMNS FROM kko_analyses LIKE 'POIDS_NOMBRE_FEVES_ENTIERES'";
  
  pool.query(sqlVerification, (err, results) => {
    if (err) {
      console.error("Erreur vérification colonne:", err);
      return res.status(500).json({ error: 'Erreur vérification table: ' + err.message });
    }
    
    const colonneExiste = results.length > 0;
    
    let sql;
    let values;
    
    if (colonneExiste) {
      // VERSION AVEC COLONNE - 64 colonnes, 64 valeurs
      sql = `
        INSERT INTO kko_analyses (
          ID_CODIFICATION,
          DATE_ANALYSE_KKO,
          ANALYSEUR_ANALYSE_KKO,
          
          POIDS_DECLARATION,
          POIDS_ECHAN_ANALYSE_KKO,
          POIDS_TOTAL_ECHANTILLON,
          
          FEVES_ENTIERES,
          FEVES_PLATES,
          POIDS_DECHET,
          POIDS_FEVES_PLATES,
          POIDS_FEVES_ENTIERES,
          
          POIDS_BRISURES,
          POIDS_ETRANGERES,
          POIDS_FEVES_BRISEES,
          POIDS_COQUES,
          POIDS_CRABOT,
          TOTAL_LOUPE,
          
          TOTAL_FEVES_ENTIERES,
          GRAINAGE,
          POIDS_NOMBRE_FEVES_ENTIERES,
          
          LECTURE_HUMIDITE_1,
          LECTURE_HUMIDITE_2,
          LECTURE_HUMIDITE_3,
          TOTAL_HUMIDITE,
          TAUXHUMIDITE,
          
          NORME_IVOIRIENNE,
          NORME_INTERNATIONALE,
          CONFORME,
          REMARQUE,
          
          MOISIE_PLATEAU1, MOISIE_PLATEAU2, MOISIE_PLATEAU3,
          MOISIE_TOTAL, MOISIE_CALCULE,
          
          MITEE_PLATEAU1, MITEE_PLATEAU2, MITEE_PLATEAU3,
          MITEE_TOTAL, MITEE_CALCULE,
          
          ARDOISEE_PLATEAU1, ARDOISEE_PLATEAU2, ARDOISEE_PLATEAU3,
          ARDOISEE_TOTAL, ARDOISEE_CALCULE,
          
          PLATE_PLATEAU1, PLATE_PLATEAU2, PLATE_PLATEAU3,
          PLATE_TOTAL, PLATE_CALCULE,
          
          GERMEE_PLATEAU1, GERMEE_PLATEAU2, GERMEE_PLATEAU3,
          GERMEE_TOTAL, GERMEE_CALCULE,
          
          VIOLETTE_PLATEAU1, VIOLETTE_PLATEAU2, VIOLETTE_PLATEAU3,
          VIOLETTE_TOTAL, VIOLETTE_CALCULE,
          
          NBRE_FEVES_DEFAUTS,
          
          NORME_UTILISEE,
          TYPE_NORME,
          VALIDER_ANALYSE_KKO
        ) VALUES (
          ?, NOW(), ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?,
          'Norme Ivoirienne', 'GF', 0
        )
      `;
      
      values = [
        idCodification,
        utilisateurAnalyseur,
        
        poidsDeclaration || null,
        poidsEchantillon || null,
        poidsTotalEchantillon || null,
        
        fevesEntieres || null,
        fevesPlates || null,
        poidsDechet || null,
        poidsFevesPlates || null,
        poidsFevesEntieres || null,
        
        poidsBrisures || null,
        poidsEtrangeres || null,
        poidsFevesBrisees || null,
        poidsCoques || '0',
        poidsCrabot || null,
        totalLoupe,
        
        totalFevesEntieres || null,
        grainage || null,
        poidsNombreFevesEntieres || null,
        
        lectureHumidite1 || null,
        lectureHumidite2 || null,
        lectureHumidite3 || null,
        totalHumidite,
        tauxHumiditePourcentage || null,
        
        normeIvoirienne || '',
        normeInternationale || '',
        conforme ? 1 : 0,
        remarqueEtendue || '',
        
        moisiePlateau1 || null, moisiePlateau2 || null, moisiePlateau3 || null,
        totalMoisie, pourcentageMoisie,
        
        miteePlateau1 || null, miteePlateau2 || null, miteePlateau3 || null,
        totalMitee, pourcentageMitee,
        
        ardoiseePlateau1 || null, ardoiseePlateau2 || null, ardoiseePlateau3 || null,
        totalArdoisee, pourcentageArdoisee,
        
        platePlateau1 || null, platePlateau2 || null, platePlateau3 || null,
        totalPlate, pourcentagePlate,
        
        germeePlateau1 || null, germeePlateau2 || null, germeePlateau3 || null,
        totalGermee, pourcentageGermee,
        
        violettePlateau1 || null, violettePlateau2 || null, violettePlateau3 || null,
        totalViolette, pourcentageViolette,
        
        nbreFevesDefauts || '300'
      ];
    } else {
      // VERSION SANS COLONNE - 63 colonnes, 63 valeurs
      sql = `
        INSERT INTO kko_analyses (
          ID_CODIFICATION,
          DATE_ANALYSE_KKO,
          ANALYSEUR_ANALYSE_KKO,
          
          POIDS_DECLARATION,
          POIDS_ECHAN_ANALYSE_KKO,
          POIDS_TOTAL_ECHANTILLON,
          
          FEVES_ENTIERES,
          FEVES_PLATES,
          POIDS_DECHET,
          POIDS_FEVES_PLATES,
          POIDS_FEVES_ENTIERES,
          
          POIDS_BRISURES,
          POIDS_ETRANGERES,
          POIDS_FEVES_BRISEES,
          POIDS_COQUES,
          POIDS_CRABOT,
          TOTAL_LOUPE,
          
          TOTAL_FEVES_ENTIERES,
          GRAINAGE,
          
          LECTURE_HUMIDITE_1,
          LECTURE_HUMIDITE_2,
          LECTURE_HUMIDITE_3,
          TOTAL_HUMIDITE,
          TAUXHUMIDITE,
          
          NORME_IVOIRIENNE,
          NORME_INTERNATIONALE,
          CONFORME,
          REMARQUE,
          
          MOISIE_PLATEAU1, MOISIE_PLATEAU2, MOISIE_PLATEAU3,
          MOISIE_TOTAL, MOISIE_CALCULE,
          
          MITEE_PLATEAU1, MITEE_PLATEAU2, MITEE_PLATEAU3,
          MITEE_TOTAL, MITEE_CALCULE,
          
          ARDOISEE_PLATEAU1, ARDOISEE_PLATEAU2, ARDOISEE_PLATEAU3,
          ARDOISEE_TOTAL, ARDOISEE_CALCULE,
          
          PLATE_PLATEAU1, PLATE_PLATEAU2, PLATE_PLATEAU3,
          PLATE_TOTAL, PLATE_CALCULE,
          
          GERMEE_PLATEAU1, GERMEE_PLATEAU2, GERMEE_PLATEAU3,
          GERMEE_TOTAL, GERMEE_CALCULE,
          
          VIOLETTE_PLATEAU1, VIOLETTE_PLATEAU2, VIOLETTE_PLATEAU3,
          VIOLETTE_TOTAL, VIOLETTE_CALCULE,
          
          NBRE_FEVES_DEFAUTS,
          
          NORME_UTILISEE,
          TYPE_NORME,
          VALIDER_ANALYSE_KKO
        ) VALUES (
          ?, NOW(), ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?,
          'Norme Ivoirienne', 'GF', 0
        )
      `;
      
      values = [
        idCodification,
        utilisateurAnalyseur,
        
        poidsDeclaration || null,
        poidsEchantillon || null,
        poidsTotalEchantillon || null,
        
        fevesEntieres || null,
        fevesPlates || null,
        poidsDechet || null,
        poidsFevesPlates || null,
        poidsFevesEntieres || null,
        
        poidsBrisures || null,
        poidsEtrangeres || null,
        poidsFevesBrisees || null,
        poidsCoques || '0',
        poidsCrabot || null,
        totalLoupe,
        
        totalFevesEntieres || null,
        grainage || null,
        
        lectureHumidite1 || null,
        lectureHumidite2 || null,
        lectureHumidite3 || null,
        totalHumidite,
        tauxHumiditePourcentage || null,
        
        normeIvoirienne || '',
        normeInternationale || '',
        conforme ? 1 : 0,
        remarqueEtendue || '',
        
        moisiePlateau1 || null, moisiePlateau2 || null, moisiePlateau3 || null,
        totalMoisie, pourcentageMoisie,
        
        miteePlateau1 || null, miteePlateau2 || null, miteePlateau3 || null,
        totalMitee, pourcentageMitee,
        
        ardoiseePlateau1 || null, ardoiseePlateau2 || null, ardoiseePlateau3 || null,
        totalArdoisee, pourcentageArdoisee,
        
        platePlateau1 || null, platePlateau2 || null, platePlateau3 || null,
        totalPlate, pourcentagePlate,
        
        germeePlateau1 || null, germeePlateau2 || null, germeePlateau3 || null,
        totalGermee, pourcentageGermee,
        
        violettePlateau1 || null, violettePlateau2 || null, violettePlateau3 || null,
        totalViolette, pourcentageViolette,
        
        nbreFevesDefauts || '300'
      ];
    }
    
    console.log('Enregistrement analyse cacao avec', values.length, 'valeurs');
    console.log('Colonne POIDS_NOMBRE_FEVES_ENTIERES existe:', colonneExiste);
    
    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erreur enregistrement analyse cacao:", err);
        console.error("SQL Error:", err.sqlMessage);
        
        return res.status(500).json({ 
          error: 'Erreur enregistrement: ' + err.message,
          sqlError: err.sqlMessage,
          colonneExiste: colonneExiste
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Analyse cacao enregistrée avec succès',
        idAnalyse: result.insertId,
        colonneUtilisee: colonneExiste ? 'POIDS_NOMBRE_FEVES_ENTIERES' : 'REMARQUE'
      });
    });
  });
});

// ===============================================
// NOUVELLE ROUTE : Enregistrer analyse CAFÉ
// ===============================================
app.post('/api/analyses/cafe', (req, res) => {
  const {
    idCodification,
    tauxHumidite,
    normeClassification,
    tamis18_saisi,
    tamis16_saisi,
    tamis14_saisi,
    tamis12_saisi,
    tamis10_saisi,
    tamisbas_saisi,
    nbreDefaut,
    poidsDefaut,
    analyseurId
  } = req.body;
  
  // Fonction de calcul : (valeur * 100) / 3
  const calculer = (valeur) => {
    if (!valeur) return null;
    return (parseFloat(valeur) * 100) / 3;
  };
  
  // Utiliser l'analyseurId fourni ou une valeur par défaut qui existe
  const utilisateurAnalyseur = analyseurId || 7; // ID_UTILISATEURS = 7 (Ange Man)
  
  const sql = `
    INSERT INTO kfe_analyses (
      ID_CODIFICATION,
      TAUXHUMIDITE,
      NORME_CLASSIFICATION,
      TAMIS18_SAISI, TAMIS18_CALCULE,
      TAMIS16_SAISI, TAMIS16_CALCULE,
      TAMIS14_SAISI, TAMIS14_CALCULE,
      TAMIS12_SAISI, TAMIS12_CALCULE,
      TAMIS10_SAISI, TAMIS10_CALCULE,
      TAMISBAS_SAISI, TAMISBAS_CALCULE,
      NBREDEFAUT,
      POIDSDEFAUT,
      ANALYSEUR_ANALYSE_KFE,
      DATE_ANALYSE_KFE,
      VALIDER_ANALYSE_KFE
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)
  `;
  
  pool.query(sql, [
    idCodification,
    tauxHumidite,
    normeClassification,
    tamis18_saisi, calculer(tamis18_saisi),
    tamis16_saisi, calculer(tamis16_saisi),
    tamis14_saisi, calculer(tamis14_saisi),
    tamis12_saisi, calculer(tamis12_saisi),
    tamis10_saisi, calculer(tamis10_saisi),
    tamisbas_saisi, calculer(tamisbas_saisi),
    nbreDefaut,
    poidsDefaut,
    utilisateurAnalyseur
  ], (err, result) => {
    if (err) {
      console.error("Erreur enregistrement analyse café:", err);
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ 
      success: true, 
      message: 'Analyse café enregistrée avec succès',
      idAnalyse: result.insertId
    });
  });
});

// ===============================================
// ROUTES POUR LA GESTION DES RÉSULTATS D'ANALYSES
// ===============================================

// Route pour récupérer toutes les analyses Cacao avec filtres
app.get('/api/analyses/cacao', (req, res) => {
  const { 
    codeSecret, dateDebut, dateFin, campagne, ville, 
    exportateur, conforme, limit 
  } = req.query;
  
  let sql = `
    SELECT 
      ka.*,
      rc.CODE_SECRET_CODIFICATION,
      l.NUM_LOTS,
      e.RAISONSOCIALE_EXPORTATEUR,
      p.LIBELLE_PRODUIT,
      d.CAMP_DEMANDE,
      d.VILLE_DEMANDE,
      u.NOM_UTILISATEURS as NOM_ANALYSEUR
    FROM kko_analyses ka
    LEFT JOIN registre_codification rc ON ka.ID_CODIFICATION = rc.ID_CODIFICATION
    LEFT JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    LEFT JOIN lots l ON rs.ID_Lot = l.ID_LOTS
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    LEFT JOIN utilisateurs u ON ka.ANALYSEUR_ANALYSE_KKO = u.ID_UTILISATEURS
    WHERE 1=1
  `;
  
  const params = [];
  
  // Filtres
  if (codeSecret) {
    sql += " AND rc.CODE_SECRET_CODIFICATION LIKE ?";
    params.push(`%${codeSecret}%`);
  }
  
  if (dateDebut) {
    sql += " AND DATE(ka.DATE_ANALYSE_KKO) >= ?";
    params.push(dateDebut);
  }
  
  if (dateFin) {
    sql += " AND DATE(ka.DATE_ANALYSE_KKO) <= ?";
    params.push(dateFin);
  }
  
  if (campagne && campagne !== 'all') {
    sql += " AND d.CAMP_DEMANDE = ?";
    params.push(campagne);
  }
  
  if (ville && ville !== 'all') {
    sql += " AND d.VILLE_DEMANDE = ?";
    params.push(ville);
  }
  
  if (exportateur && exportateur !== 'all') {
    sql += " AND e.RAISONSOCIALE_EXPORTATEUR LIKE ?";
    params.push(`%${exportateur}%`);
  }
  
  if (conforme && conforme !== 'all') {
    const conformeBool = conforme === 'conforme' ? 1 : 0;
    sql += " AND ka.CONFORME = ?";
    params.push(conformeBool);
  }
  
  sql += " ORDER BY ka.DATE_ANALYSE_KKO DESC";
  
  // Limite
  if (limit) {
    sql += " LIMIT ?";
    params.push(parseInt(limit));
  } else {
    sql += " LIMIT 100"; // Limite par défaut
  }
  
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erreur récupération analyses cacao:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results || []);
  });
});

// Route pour valider/rejeter des analyses
app.post('/api/analyses/valider', (req, res) => {
  const { analysesIds, valider } = req.body;
  
  if (!analysesIds || !Array.isArray(analysesIds) || analysesIds.length === 0) {
    return res.status(400).json({ error: "Liste d'analyses invalide" });
  }
  
  const validerInt = valider ? 1 : 0;
  
  pool.query(
    "UPDATE kko_analyses SET VALIDER_ANALYSE_KKO = ? WHERE ID_ANALYSE_KKO IN (?)",
    [validerInt, analysesIds],
    (err, result) => {
      if (err) {
        console.error("Erreur validation analyses:", err);
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        success: true, 
        message: `${result.affectedRows} analyse(s) ${valider ? 'validée(s)' : 'rejetée(s)'} avec succès` 
      });
    }
  );
});

// Route pour modifier une analyse
app.put('/api/analyses/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Vérifier que l'analyse existe
  pool.query("SELECT * FROM kko_analyses WHERE ID_ANALYSE_KKO = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur vérification analyse:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Analyse non trouvée" });
    }
    
    // Construire la requête de mise à jour dynamiquement
    const setClauses = [];
    const values = [];
    
    // Champs modifiables
    const allowedFields = [
      'POIDS_BRISURES', 'POIDS_DECHET', 'POIDS_CRABOT', 'POIDS_ETRANGERES',
      'TAUXHUMIDITE', 'CONFORME', 'REMARQUE', 'MOISIE_CALCULE',
      'MITEE_CALCULE', 'ARDOISEE_CALCULE', 'PLATE_CALCULE',
      'GERMEE_CALCULE', 'VIOLETTE_CALCULE', 'NORME_IVOIRIENNE',
      'NORME_INTERNATIONALE'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });
    
    if (setClauses.length === 0) {
      return res.status(400).json({ error: "Aucune modification à apporter" });
    }
    
    // Ajouter l'ID à la fin des valeurs
    values.push(id);
    
    const sql = `UPDATE kko_analyses SET ${setClauses.join(', ')} WHERE ID_ANALYSE_KKO = ?`;
    
    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error("Erreur modification analyse:", err);
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        success: true, 
        message: "Analyse modifiée avec succès",
        affectedRows: result.affectedRows 
      });
    });
  });
});

// Route pour récupérer une analyse spécifique
app.get('/api/analyses/:id', (req, res) => {
  const { id } = req.params;
  
  pool.query(`
    SELECT 
      ka.*,
      rc.CODE_SECRET_CODIFICATION,
      l.NUM_LOTS,
      e.RAISONSOCIALE_EXPORTATEUR,
      p.LIBELLE_PRODUIT,
      d.CAMP_DEMANDE,
      d.VILLE_DEMANDE,
      u.NOM_UTILISATEURS as NOM_ANALYSEUR
    FROM kko_analyses ka
    LEFT JOIN registre_codification rc ON ka.ID_CODIFICATION = rc.ID_CODIFICATION
    LEFT JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    LEFT JOIN lots l ON rs.ID_Lot = l.ID_LOTS
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    LEFT JOIN utilisateurs u ON ka.ANALYSEUR_ANALYSE_KKO = u.ID_UTILISATEURS
    WHERE ka.ID_ANALYSE_KKO = ?
  `, [id], (err, results) => {
    if (err) {
      console.error("Erreur récupération analyse:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Analyse non trouvée" });
    }
    
    res.json(results[0]);
  });
});

// Route pour supprimer une analyse
app.delete('/api/analyses/:id', (req, res) => {
  const { id } = req.params;
  
  pool.query("DELETE FROM kko_analyses WHERE ID_ANALYSE_KKO = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur suppression analyse:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Analyse non trouvée" });
    }
    
    res.json({ 
      success: true, 
      message: "Analyse supprimée avec succès" 
    });
  });
});

// Route pour récupérer toutes les demandes avec filtres
app.get('/api/demandes', (req, res) => {
  const { ref, aut, exportateur, campagne, produit, ville, dateDebut, dateFin } = req.query;
  let sql = `
    SELECT 
      d.ID_DEMANDE, 
      d.REF_DEMANDE, 
      d.AUT_DEMANDE, 
      d.DATEEMI_DEMANDE, 
      d.DATEREC_DEMANDE, 
      d.DATE_EXPIR_DEMANDE,
      d.CAMP_DEMANDE, 
      d.VILLE_DEMANDE,
      p.LIBELLE_PRODUIT, 
      e.RAISONSOCIALE_EXPORTATEUR AS EXPORTATEUR,
      e.MARQUE_EXPORTATEUR,
      e.VILLE_EXPORTATEUR, 
      d.NBRELOT_DEMANDE, 
      d.POIDS_DEMANDE,
      d.NBRE_BV_DEMANDE, 
      d.NBRE_BA_DEMANDE, 
      d.ETAT_DEMANDE
    FROM demandes d
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    WHERE 1=1
  `;
  const params = [];
  
  // Filtres exacts pour les champs spécifiques
  if (ref) { 
    sql += " AND d.REF_DEMANDE LIKE ?"; 
    params.push(`%${ref}%`); 
  }
  if (aut) { 
    sql += " AND d.AUT_DEMANDE LIKE ?";
    params.push(`%${aut}%`); 
  }
  if (exportateur) { 
    sql += " AND d.ID_EXPORTATEUR = ?"; 
    params.push(exportateur);
  }
  if (campagne) { 
    sql += " AND d.CAMP_DEMANDE = ?"; 
    params.push(campagne);
  }
  if (produit) { 
    sql += " AND d.ID_PRODUIT = ?"; 
    params.push(produit);
  }
  if (ville) { 
    sql += " AND d.VILLE_DEMANDE = ?"; 
    params.push(ville);
  }
  
  // Filtres de date
  if (dateDebut) { 
    sql += " AND DATE(d.DATEEMI_DEMANDE) >= ?";
    params.push(dateDebut); 
  }
  if (dateFin) { 
    sql += " AND DATE(d.DATEEMI_DEMANDE) <= ?"; 
    params.push(dateFin);
  }
  
  sql += " ORDER BY d.ID_DEMANDE DESC LIMIT 200";
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erreur recherche demandes:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route pour récupérer une demande spécifique (pour modification)
app.get('/api/demandes/:id', (req, res) => {
  const { id } = req.params;
  pool.query(`
    SELECT 
      d.*, 
      p.LIBELLE_PRODUIT, 
      e.RAISONSOCIALE_EXPORTATEUR,
      e.MARQUE_EXPORTATEUR,
      e.VILLE_EXPORTATEUR,
      d.VILLE_DEMANDE
    FROM demandes d
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    WHERE d.ID_DEMANDE = ?
  `, [id], (err, results) => {
    if (err) {
      console.error("Erreur récupération demande:", err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Demande non trouvée' });
    res.json(results[0]);
  });
});

// Route pour récupérer les lots d'une demande
app.get('/api/demandes/:id/lots', (req, res) => {
  const { id } = req.params;
  pool.query(`
    SELECT 
      l.NUM_LOTS as numero, 
      l.NBRESAC_LOTS as nbreSac, 
      l.POIDS_LOTS as poidsNet, 
      COALESCE(m.LIBELLE_MARQUE, e.MARQUE_EXPORTATEUR) as marque, 
      mg.NOM_MAGASIN as magasin, 
      l.RECOLTE_LOTS as recolte,
      l.ID_GRADE as qualite,
      l.STATUT_LOTS as parite
    FROM 
    lots l
    LEFT JOIN marques m ON l.ID_MARQUE = m.ID_MARQUE
    LEFT JOIN magasins mg ON l.ID_ENTREPOT = mg.ID_MAGASIN
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    WHERE l.ID_DEMANDE = ?
    ORDER BY l.NUM_LOTS
  `, [id], (err, results) => {
    if (err) {
      console.error("Erreur récupération lots:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// ===============================================
// ROUTES POUR LA TABLE analysevalider
// ===============================================

// Route pour valider/rejeter des analyses et les enregistrer dans analysevalider
app.post('/api/analyses/valider', async (req, res) => {
  const { analysesIds, valider } = req.body;
  
  if (!analysesIds || !Array.isArray(analysesIds) || analysesIds.length === 0) {
    return res.status(400).json({ error: "Liste d'analyses invalide" });
  }
  
  const validerInt = valider ? 1 : 0;
  const action = valider ? 'validate' : 'reject';
  const statut = valider ? 'validé' : 'rejeté';
  const validateurId = 7; // ID de l'utilisateur par défaut (Ange Man)
  
  try {
    // Pour chaque analyse, récupérer les données et les insérer dans analysevalider
    for (const analyseId of analysesIds) {
      // Récupérer les données de l'analyse
      const analyseData = await new Promise((resolve, reject) => {
        pool.query(`
          SELECT 
            ka.*,
            rc.CODE_SECRET_CODIFICATION,
            l.NUM_LOTS,
            e.RAISONSOCIALE_EXPORTATEUR,
            p.LIBELLE_PRODUIT,
            d.CAMP_DEMANDE,
            d.VILLE_DEMANDE
          FROM kko_analyses ka
          LEFT JOIN registre_codification rc ON ka.ID_CODIFICATION = rc.ID_CODIFICATION
          LEFT JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
          LEFT JOIN lots l ON rs.ID_Lot = l.ID_LOTS
          LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
          LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
          LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
          WHERE ka.ID_ANALYSE_KKO = ?
        `, [analyseId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });
      
      if (!analyseData) {
        console.error(`Analyse ${analyseId} non trouvée`);
        continue;
      }
      
      // Insérer dans analysevalider
      await new Promise((resolve, reject) => {
        pool.query(`
          INSERT INTO analysevalider (
            ID_ANALYSE_KKO, CODE_SECRET_CODIFICATION, DATE_VALIDATION, VALIDATEUR_ID, ACTION,
            NORME_IVOIRIENNE, NORME_INTERNATIONALE, CONFORME, REMARQUE, STATUT,
            POIDS_BRISURES, POIDS_DECHET, POIDS_CRABOT, POIDS_ETRANGERES,
            GRAINAGE, TAUXHUMIDITE, MOISIE_CALCULE, MITEE_CALCULE, ARDOISEE_CALCULE,
            PLATE_CALCULE, GERMEE_CALCULE, VIOLETTE_CALCULE,
            NUM_LOTS, RAISONSOCIALE_EXPORTATEUR, LIBELLE_PRODUIT,
            CAMP_DEMANDE, VILLE_DEMANDE
          ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          analyseId,
          analyseData.CODE_SECRET_CODIFICATION || '',
          validateurId,
          action,
          analyseData.NORME_IVOIRIENNE || '',
          analyseData.NORME_INTERNATIONALE || '',
          analyseData.CONFORME || 0,
          analyseData.REMARQUE || '',
          statut,
          analyseData.POIDS_BRISURES || 0,
          analyseData.POIDS_DECHET || 0,
          analyseData.POIDS_CRABOT || 0,
          analyseData.POIDS_ETRANGERES || 0,
          analyseData.GRAINAGE || 0,
          analyseData.TAUXHUMIDITE || 0,
          analyseData.MOISIE_CALCULE || 0,
          analyseData.MITEE_CALCULE || 0,
          analyseData.ARDOISEE_CALCULE || 0,
          analyseData.PLATE_CALCULE || 0,
          analyseData.GERMEE_CALCULE || 0,
          analyseData.VIOLETTE_CALCULE || 0,
          analyseData.NUM_LOTS || '',
          analyseData.RAISONSOCIALE_EXPORTATEUR || '',
          analyseData.LIBELLE_PRODUIT || '',
          analyseData.CAMP_DEMANDE || '',
          analyseData.VILLE_DEMANDE || ''
        ], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      // Mettre à jour le statut dans kko_analyses
      await new Promise((resolve, reject) => {
        pool.query(
          "UPDATE kko_analyses SET VALIDER_ANALYSE_KKO = ? WHERE ID_ANALYSE_KKO = ?",
          [validerInt, analyseId],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    }
    
    res.json({ 
      success: true, 
      message: `${analysesIds.length} analyse(s) ${valider ? 'validée(s)' : 'rejetée(s)'} et enregistrée(s) avec succès` 
    });
    
  } catch (error) {
    console.error("Erreur validation analyses:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les analyses validées
app.get('/api/analyses/validees', (req, res) => {
  const { 
    dateDebut, dateFin, campagne, ville, exportateur, 
    statut, limit 
  } = req.query;
  
  let sql = `
    SELECT 
      av.*,
      u.NOM_UTILISATEURS as NOM_VALIDATEUR,
      ka.DATE_ANALYSE_KKO,
      ua.NOM_UTILISATEURS as NOM_ANALYSEUR
    FROM analysevalider av
    LEFT JOIN utilisateurs u ON av.VALIDATEUR_ID = u.ID_UTILISATEURS
    LEFT JOIN kko_analyses ka ON av.ID_ANALYSE_KKO = ka.ID_ANALYSE_KKO
    LEFT JOIN utilisateurs ua ON ka.ANALYSEUR_ANALYSE_KKO = ua.ID_UTILISATEURS
    WHERE 1=1
  `;
  
  const params = [];
  
  // Filtres
  if (dateDebut) {
    sql += " AND DATE(av.DATE_VALIDATION) >= ?";
    params.push(dateDebut);
  }
  
  if (dateFin) {
    sql += " AND DATE(av.DATE_VALIDATION) <= ?";
    params.push(dateFin);
  }
  
  if (campagne && campagne !== 'all') {
    sql += " AND av.CAMP_DEMANDE = ?";
    params.push(campagne);
  }
  
  if (ville && ville !== 'all') {
    sql += " AND av.VILLE_DEMANDE = ?";
    params.push(ville);
  }
  
  if (exportateur && exportateur !== 'all') {
    sql += " AND av.RAISONSOCIALE_EXPORTATEUR LIKE ?";
    params.push(`%${exportateur}%`);
  }
  
  if (statut && statut !== 'all') {
    sql += " AND av.STATUT = ?";
    params.push(statut);
  }
  
  sql += " ORDER BY av.DATE_VALIDATION DESC";
  
  // Limite
  if (limit) {
    sql += " LIMIT ?";
    params.push(parseInt(limit));
  } else {
    sql += " LIMIT 100";
  }
  
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erreur récupération analyses validées:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results || []);
  });
});

// === ROUTES POUR LE SONDAGE ===

// Route pour récupérer les lots avec filtres pour le sondage
app.get('/api/sondage/lots', (req, res) => {
  const { reference, numeroLot, exportateur, produit, recolte, ville, dateDebut, dateFin, sondes } = req.query;
  
  let sql = `
    SELECT 
      l.ID_LOTS,
      l.NUM_LOTS,
      d.REF_DEMANDE,
      p.LIBELLE_PRODUIT,
      d.VILLE_DEMANDE,
      e.RAISONSOCIALE_EXPORTATEUR,
      d.DATEREC_DEMANDE,
      d.DATE_EXPIR_DEMANDE,
      l.RECOLTE_LOTS,
      mg.NOM_MAGASIN,
      l.ID_GRADE,
      l.ETAT_SONDAGE_LOTS,
      l.ETAT_CODIFICATION_LOTS
    FROM lots l
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    LEFT JOIN magasins mg ON l.ID_ENTREPOT = mg.ID_MAGASIN  
    WHERE 1=1
  `;
  
  const params = [];
  
  // Filtres
  if (reference) {
    sql += " AND d.REF_DEMANDE LIKE ?";
    params.push(`%${reference}%`);
  }
  if (numeroLot) {
    sql += " AND l.NUM_LOTS LIKE ?";
    params.push(`%${numeroLot}%`);
  }
  if (exportateur) {
    sql += " AND d.ID_EXPORTATEUR = ?";
    params.push(exportateur);
  }
  if (produit) {
    sql += " AND d.ID_PRODUIT = ?";
    params.push(produit);
  }
  if (recolte) {
    sql += " AND l.RECOLTE_LOTS LIKE ?";
    params.push(`%${recolte}%`);
  }
  if (ville) {
    sql += " AND d.VILLE_DEMANDE = ?";
    params.push(ville);
  }
  if (dateDebut) {
    sql += " AND DATE(d.DATEREC_DEMANDE) >= ?";
    params.push(dateDebut);
  }
  if (dateFin) {
    sql += " AND DATE(d.DATEREC_DEMANDE) <= ?";
    params.push(dateFin);
  }
  
  // Filtrer uniquement les lots sondés si demandé
  if (sondes === 'true') {
    sql += " AND l.ETAT_SONDAGE_LOTS = 'OUI'";
  }
  
  sql += " ORDER BY l.ID_LOTS DESC LIMIT 100";
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erreur recherche lots sondage:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// ===============================================
// === Route POST pour l'enregistrement du sondage d'un ou plusieurs lots ===
// ===============================================
app.post('/api/lots/enregistrerSondage', async (req, res) => {
  const {
    lotIds, // Tableau d'ID des lots sondés
    dateSondage,
    codeSondeur,
    observationSondage,
    decisionSondage,
    nbreEchanSondage,
    poidsTotalSondage,
  } = req.body;

  // Fonction pour garantir qu'un champ optionnel est NULL si vide
  const toNullable = (value) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return null;
    }
    return value;
  };

  if (!lotIds || lotIds.length === 0) {
    return res.status(400).json({ error: "Aucun lot sélectionné" });
  }

  // Conversion de la décision
  const etatSondage = decisionSondage === 'Oui' ? 1 : 0;
  const statutLot = decisionSondage === 'Oui' ? 'OUI' : 'NON';
  
  // Nettoyage des champs
  const cleanedNbreEchan = toNullable(nbreEchanSondage);
  const cleanedPoidsTotal = toNullable(poidsTotalSondage);
  const cleanedObservation = toNullable(observationSondage);
  
  // Vérifier que le code sondeur existe dans la table utilisateurs si la décision est "Oui"
  let cleanedCodeSondeur = toNullable(codeSondeur);
  if (decisionSondage === 'Oui' && cleanedCodeSondeur !== null) {
      const parsedInt = parseInt(cleanedCodeSondeur);
      cleanedCodeSondeur = isNaN(parsedInt) ? null : parsedInt;
      
      // Vérifier que l'utilisateur existe et est un sondeur
      if (cleanedCodeSondeur) {
        try {
          const userCheck = await new Promise((resolve, reject) => {
            pool.query(`
              SELECT u.ID_UTILISATEURS 
              FROM utilisateurs u
              LEFT JOIN fonctions f ON u.ID_FONCTIONS = f.ID_FONCTIONS
              WHERE u.ID_UTILISATEURS = ? 
              AND (f.LIBELLE_FONCTIONS = 'SONDEUR' OR u.ID_FONCTIONS = 10)
            `, [cleanedCodeSondeur], (err, results) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
            });
          });
          
          if (userCheck.length === 0) {
            return res.status(400).json({ 
              error: "L'utilisateur sélectionné n'est pas un sondeur valide",
              codeSondeur: cleanedCodeSondeur
            });
          }
        } catch (err) {
          console.error("Erreur vérification utilisateur:", err);
          return res.status(500).json({ error: "Erreur lors de la vérification du sondeur" });
        }
      } else {
        return res.status(400).json({ error: "Un sondeur valide doit être sélectionné pour le sondage" });
      }
  } else if (decisionSondage === 'Oui') {
    return res.status(400).json({ error: "Un sondeur doit être sélectionné pour le sondage" });
  }

  // Date par défaut si non fournie
  const cleanedDateSondage = dateSondage || new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Obtenir une connexion du pool pour la transaction
  pool.getConnection(async (err, connection) => {
    if (err) {
      console.error("ERREUR DE CONNEXION:", err);
      return res.status(500).json({ error: "Erreur de connexion à la base de données." });
    }

    // Démarrer la transaction
    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        console.error("ERREUR DÉBUT TRANSACTION:", err);
        return res.status(500).json({ error: "Erreur de démarrage de la transaction." });
      }

      try {
        // Mise à jour des lots et insertion dans resgistre_sondage
        for (const idLot of lotIds) {
          // 1. Mise à jour de l'ETAT_SONDAGE_LOTS dans la table lots
          const updateLotQuery = "UPDATE lots SET ETAT_SONDAGE_LOTS = ? WHERE ID_LOTS = ?";
          await new Promise((resolve, reject) => {
            connection.query(updateLotQuery, [statutLot, idLot], (err) => {
              if (err) {
                console.error(`Erreur mise à jour lot ${idLot}:`, err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
          
          // 2. Insertion dans resgistre_sondage UNIQUEMENT si la décision est 'Oui' (Sondé)
          if (etatSondage === 1) {
            const insertSondageQuery = `
              INSERT INTO resgistre_sondage 
              (ID_LOT, DATE_SONDAGE_LOT, CODE_SONDEUR_SONDAGE, OBSERVATION_SONDAGE, 
               ETAT_SONDAGE, NBRE_ECHAN_SONDAGE, POIDS_TOTAL_SONDAGE) 
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
              idLot,
              cleanedDateSondage,
              cleanedCodeSondeur,
              cleanedObservation,
              etatSondage,
              cleanedNbreEchan,
              cleanedPoidsTotal
            ];
            
            await new Promise((resolve, reject) => {
              connection.query(insertSondageQuery, values, (err, result) => {
                if (err) {
                  console.error(`[ERREUR INSERTION resgistre_sondage pour Lot ${idLot}]`, err);
                  reject(err);
                } else {
                  console.log(`Lot ${idLot} enregistré dans resgistre_sondage, ID: ${result.insertId}`);
                  resolve();
                }
              });
            });
          } else {
            console.log(`Lot ${idLot} marqué comme NON sondé`);
          }
        }

        // Commit de la transaction
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("ERREUR COMMIT:", err);
              res.status(500).json({ error: "Échec de l'enregistrement. Erreur: " + err.message });
            });
          }
          
          connection.release();
          
          // Message selon la décision
          const message = decisionSondage === 'Oui' 
            ? `${lotIds.length} lot(s) sondé(s) et enregistré(s) dans le registre de sondage` 
            : `${lotIds.length} lot(s) marqué(s) comme non sondé(s)`;
          
          res.json({ 
            success: true, 
            message: message,
            lotsTraites: lotIds.length,
            decision: decisionSondage
          });
        });
      } catch (error) {
        // Rollback en cas d'erreur
        connection.rollback(() => {
          connection.release();
          console.error("ERREUR LORS DE L'OPÉRATION:", error);
          res.status(500).json({ 
            error: "Échec de l'enregistrement du sondage", 
            details: error.message 
          });
        });
      }
    });
  });
});

// Route pour valider la décision de sondage (version simplifiée)
app.post('/api/sondage/valider', (req, res) => {
  const { lotsIds, decision } = req.body;
  
  if (!lotsIds || !Array.isArray(lotsIds) || lotsIds.length === 0) {
    return res.status(400).json({ error: "Liste des lots invalide" });
  }
  
  // Préparer les données pour l'enregistrement complet
  const sondageData = {
    lotIds: lotsIds,
    dateSondage: new Date().toISOString().slice(0, 19).replace('T', ' '),
    codeSondeur: null,
    observationSondage: `Sondage validé le ${new Date().toLocaleDateString('fr-FR')}`,
    decisionSondage: decision,
    nbreEchanSondage: 10,
    poidsTotalSondage: 100
  };
  
  // Appeler directement la route d'enregistrement
  req.body = sondageData;
  
  // Trouver et appeler la route /api/lots/enregistrerSondage
  const routeHandler = app._router.stack.find(layer => 
    layer.route && layer.route.path === '/api/lots/enregistrerSondage'
  );
  
  if (routeHandler && routeHandler.route.stack[0].handle) {
    return routeHandler.route.stack[0].handle(req, res);
  } else {
    // Fallback : appeler directement la fonction
    return app.post('/api/lots/enregistrerSondage', req, res);
  }
});

// Route pour supprimer une demande
app.delete('/api/demandes/:id', (req, res) => {
  const { id } = req.params;
  
  // D'abord supprimer les lots associés
  pool.query('DELETE FROM lots WHERE ID_DEMANDE = ?', [id], (err) => {
    if (err) {
      console.error("Erreur suppression lots:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Puis supprimer la demande
    pool.query('DELETE FROM demandes WHERE ID_DEMANDE = ?', [id], (err, result) => {
      if (err) {
        console.error("Erreur suppression demande:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Demande supprimée avec succès' });
    });
  });
});

// Route pour modifier une demande
app.put('/api/demandes/:id', (req, res) => {
  const { id } = req.params;
  const b = req.body;

  if (!b.refDemande || !b.produit || !b.exportateur || !b.campagne) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  // Commencer une transaction
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Erreur connexion:", err);
      return res.status(500).json({ error: err.message });
    }

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error("Erreur début transaction:", err);
        return res.status(500).json({ error: err.message });
      }

      // Mettre à jour la demande
      const sqlUpdateDemande = `
        UPDATE demandes SET
          REF_DEMANDE = ?, 
          AUT_DEMANDE = ?, 
          DATEEMI_DEMANDE = ?, 
          DATEREC_DEMANDE = ?,
          CAMP_DEMANDE = ?, 
          ID_PRODUIT = ?, 
          ID_EXPORTATEUR = ?, 
          NBRELOT_DEMANDE = ?, 
          POIDS_DEMANDE = ?,
          NATURE_DEMANDE = ?, 
          DATE_EXPIR_DEMANDE = ?,
          VILLE_DEMANDE = ?
        WHERE ID_DEMANDE = ?
      `;

      connection.query(sqlUpdateDemande, [
        b.refDemande,
        b.autDemande || '',
        b.dateEmission || null,
        b.dateReception || b.dateEmission || null,
        b.campagne,
        b.produit,
        b.exportateur,
        b.nbreLots || 0,
        b.poidsTotal || 0,
        b.natureDemande || 'Nouveau lots',
        b.dateExpiration || null,
        b.ville || null,
        id
      ], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error("Erreur mise à jour demande:", err);
            res.status(500).json({ error: err.message });
          });
        }

        // Supprimer les anciens lots
        connection.query('DELETE FROM lots WHERE ID_DEMANDE = ?', [id], err => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Erreur suppression anciens lots:", err);
              res.status(500).json({ error: err.message });
            });
          }

          // Insérer les nouveaux lots
          if (b.lots && b.lots.length > 0) {
            const lotPromises = b.lots.map(lot => {
              return new Promise((resolve, reject) => {
                let entrepotId = null;
                let marqueId = null;

                const getEntrepotId = () => {
                  return new Promise((resolveEntrepot) => {
                    if (lot.magasin) {
                      connection.query('SELECT ID_MAGASIN FROM magasins WHERE NOM_MAGASIN = ?', [lot.magasin], (err, results) => {
                        if (err) {
                          console.error("Erreur recherche magasin:", err);
                        }
                        if (!err && results.length > 0) {
                          entrepotId = results[0].ID_MAGASIN;
                        }
                        resolveEntrepot();
                      });
                    } else {
                      resolveEntrepot();
                    }
                  });
                };

                const getMarqueId = () => {
                  return new Promise((resolveMarque) => {
                    if (lot.marque) {
                      connection.query('SELECT ID_MARQUE FROM marques WHERE LIBELLE_MARQUE = ?', [lot.marque], (err, results) => {
                        if (err) {
                          console.error("Erreur recherche marque:", err);
                        }
                        if (!err && results.length > 0) {
                          marqueId = results[0].ID_MARQUE;
                        }
                        resolveMarque();
                      });
                    } else {
                      resolveMarque();
                    }
                  });
                };

                const insererLot = () => {
                  const sqlLot = `
                    INSERT INTO lots (
                      NUM_LOTS, NBRESAC_LOTS, POIDS_LOTS, RECOLTE_LOTS, ORIGINE_LOTS,
                      ID_GRADE, ID_ENTREPOT, ID_MARQUE, ID_DEMANDE, ANALYSE_LOTS,
                      ETAPE_TRAITEMENT_LOTS, ETAT_LOTS, ETAT_CODIFICATION_LOTS, ETAT_SONDAGE_LOTS, ETAT_BRASSAGE,
                      STATUT_LOTS
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NON', 1, 'NON', 'NON', 'NON', ?)
                  `;
                  connection.query(sqlLot, [
                    lot.numero || '',
                    lot.nbreSacs || 0,
                    lot.poids || 0,
                    lot.recolte || null,
                    null,
                    lot.qualite || null,
                    entrepotId,
                    marqueId,
                    id,
                    0,
                    lot.parite || '1'
                  ], (err) => {
                    if (err) {
                      console.error("Erreur insertion lot:", err);
                      reject(err);
                    } else {
                      resolve();
                    }
                  });
                };

                getEntrepotId()
                  .then(() => getMarqueId())
                  .then(() => insererLot())
                  .catch(reject);
              });
            });

            Promise.all(lotPromises)
              .then(() => {
                connection.commit(err => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error("Erreur commit:", err);
                      res.status(500).json({ error: err.message });
                    });
                  }
                  connection.release();
                  res.json({ success: true, message: 'Demande modifiée avec succès' });
                });
              })
              .catch(error => {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Erreur insertion nouveaux lots:", error);
                  res.status(500).json({ error: error.message });
                });
              });
          } else {
            // Commit si pas de lots
            connection.commit(err => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Erreur commit:", err);
                  res.status(500).json({ error: err.message });
                });
              }
              connection.release();
              res.json({ success: true, message: 'Demande modifiée avec succès' });
            });
          }
        });
      });
    });
  });
});

// === Création demande + lots ===
app.post('/api/demandes', (req, res) => {
  const b = req.body;

  if (!b.refDemande || !b.produit || !b.exportateur || !b.campagne) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  const sqlDemande = `
    INSERT INTO demandes (
      REF_DEMANDE, AUT_DEMANDE, CODE_TYPE_DEMANDE, DATEEMI_DEMANDE, DATEREC_DEMANDE,
      CAMP_DEMANDE, ID_PRODUIT, ID_EXPORTATEUR, NBRELOT_DEMANDE, POIDS_DEMANDE,
      NATURE_DEMANDE, CODE_NATURE_PRESTATION, DATE_EXPIR_DEMANDE, VILLE_DEMANDE, VALIDER_DEMANDE, ETAT_DEMANDE
    ) VALUES (?, ?, 'TYPE-A', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'En attente')
  `;

  pool.query(sqlDemande, [
    b.refDemande,
    b.autDemande || '',
    b.dateEmission || null,
    b.dateReception || b.dateEmission || null,
    b.campagne,
    b.produit,
    b.exportateur,
    b.nbreLots || 0,
    b.poidsTotal || 0,
    b.natureDemande || 'Nouveau lots',
    b.naturePrestation || 'PREST01',
    b.dateExpiration || null,
    b.ville || null,
  ], (err, result) => {
    if (err) {
      console.error("Erreur insertion demande:", err);
      return res.status(500).json({ error: err.message });
    }

    const demandeId = result.insertId;
    console.log(`Demande créée avec ID: ${demandeId}, Ville: ${b.ville || 'Non spécifiée'}`);
    if (b.lots && b.lots.length > 0) {
      const lotPromises = b.lots.map(lot => {
        return new Promise((resolve, reject) => {
          // Récupérer les IDs
          let entrepotId = null;
          let marqueId = null;

          const getEntrepotId = () => {
            return new Promise((resolveEntrepot) => {
              if (lot.magasin) {
                pool.query('SELECT ID_MAGASIN FROM magasins WHERE NOM_MAGASIN = ?', [lot.magasin], (err, results) => {
                  if (err) {
                    console.error("Erreur recherche magasin:", err);
                  }
                  if (!err && results.length > 0) {
                    entrepotId = results[0].ID_MAGASIN;
                    console.log(`Magasin trouvé: ${lot.magasin} -> ID: ${entrepotId}`);
                  } else {
                    console.log(`Magasin non trouvé: ${lot.magasin}`);
                  }
                  resolveEntrepot();
                });
              } else {
                resolveEntrepot();
              }
            });
          };

          const getMarqueId = () => {
            return new Promise((resolveMarque) => {
              if (lot.marque) {
                pool.query('SELECT ID_MARQUE FROM marques WHERE LIBELLE_MARQUE = ?', [lot.marque], (err, results) => {
                  if (err) {
                    console.error("Erreur recherche marque:", err);
                  }
                  if (!err && results.length > 0) {
                    marqueId = results[0].ID_MARQUE;
                    console.log(`Marque trouvée: ${lot.marque} -> ID: ${marqueId}`);
                  } else {
                    console.log(`Marque non trouvée: ${lot.marque}`);
                  }
                  resolveMarque();
                });
              } else {
                resolveMarque();
              }
            });
          };

          const insererLot = () => {
            const sqlLot = `
              INSERT INTO lots (
                NUM_LOTS, NBRESAC_LOTS, POIDS_LOTS, RECOLTE_LOTS, ORIGINE_LOTS,
                ID_GRADE, ID_ENTREPOT, ID_MARQUE, ID_DEMANDE, ANALYSE_LOTS,
                ETAPE_TRAITEMENT_LOTS, ETAT_LOTS, ETAT_CODIFICATION_LOTS, ETAT_SONDAGE_LOTS, ETAT_BRASSAGE,
                STATUT_LOTS
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NON', 1, 'NON', 'NON', 'NON', ?)
            `;
            const values = [
              lot.numero || '',
              lot.nbreSacs || 0,
              lot.poids || 0,
              lot.recolte || null,
              null,
              lot.qualite || null,
              entrepotId,
              marqueId,
              demandeId,
              0,
              lot.parite || '1'
            ];
            console.log(`Insertion lot:`, values);

            pool.query(sqlLot, values, (err) => {
              if (err) {
                console.error("Erreur insertion lot:", err);
                reject(err);
              } else {
                console.log(`Lot inséré avec succès: ${lot.numero}`);
                resolve();
              }
            });
          };

          getEntrepotId()
            .then(() => getMarqueId())
            .then(() => insererLot())
            .catch(reject);
        });
      });

      Promise.all(lotPromises)
        .then(() => {
          console.log(`Tous les lots insérés pour la demande ${demandeId}`);
          res.json({ success: true, demandeId });
        })
        .catch(error => {
          console.error("Erreur lors de l'insertion des lots:", error);
          res.status(500).json({ error: "Erreur lors de l'insertion des lots: " + error.message });
        });
    } else {
      console.log(`Aucun lot à insérer pour la demande ${demandeId}`);
      res.json({ success: true, demandeId });
    }
  });
});

// ===============================================
// === NOUVELLES ROUTES POUR LA CODIFICATION ===
// ===============================================

// Route pour récupérer les codes secrets existants (tous ou filtrés)
app.get('/api/codes-secrets', (req, res) => {
  const { lotIds } = req.query;
  
  let sql = `
    SELECT 
      rc.ID_CODIFICATION,
      rc.CODE_SECRET_CODIFICATION,
      rc.DATE_ENREG_CODIFICATION,
      rc.LIBELLE_CODIFICATION,
      l.NUM_LOTS,
      p.LIBELLE_PRODUIT,
      e.RAISONSOCIALE_EXPORTATEUR as exportateur
    FROM registre_codification rc
    LEFT JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    LEFT JOIN lots l ON rs.ID_Lot = l.ID_LOTS
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    WHERE 1=1
  `;
  
  const params = [];
  
  // Filtrer par lots si lotIds est fourni
  if (lotIds) {
    const ids = lotIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (ids.length > 0) {
      sql += " AND l.ID_LOTS IN (?)";
      params.push(ids);
    }
  }
  
  sql += " ORDER BY rc.DATE_ENREG_CODIFICATION DESC LIMIT 100";
  
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erreur récupération codes secrets:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route pour récupérer le nombre de lots codifiés aujourd'hui
app.get('/api/lots/codified/count-today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  pool.query(`
    SELECT COUNT(*) as count 
    FROM registre_codification 
    WHERE DATE(DATE_ENREG_CODIFICATION) = ?
  `, [today], (err, results) => {
    if (err) {
      console.error("Erreur comptage codes aujourd'hui:", err);
      return res.json({ count: 0 });
    }
    res.json({ count: results[0].count || 0 });
  });
});

// Route pour gérer le code du jour
app.get('/api/code-jour/current', (req, res) => {
  pool.query(`
    SELECT 
      CODE_JOUR as codeJour,
      DATE_INITIALISATION as dateInitialisation,
      INITIALISE_PAR as initialisePar,
      STATUT as statut
    FROM code_jour 
    WHERE STATUT = 'ACTIF' 
    ORDER BY DATE_INITIALISATION DESC 
    LIMIT 1
  `, (err, results) => {
    if (err) {
      console.error("Erreur récupération code jour:", err);
      return res.json({ codeJour: 0, statut: 'INACTIF' });
    }
    if (results.length === 0) {
      return res.json({ codeJour: 0, statut: 'INACTIF' });
    }
    res.json(results[0]);
  });
});

// Route pour initialiser le code du jour
app.post('/api/code-jour/initialize', (req, res) => {
  const { dateInitialisation, initialisePar } = req.body;
  
  // D'abord désactiver tous les codes actifs
  pool.query("UPDATE code_jour SET STATUT = 'INACTIF' WHERE STATUT = 'ACTIF'", (err) => {
    if (err) {
      console.error("Erreur désactivation codes:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Puis créer le nouveau code du jour
    pool.query(`
      INSERT INTO code_jour (CODE_JOUR, DATE_INITIALISATION, INITIALISE_PAR, STATUT)
      VALUES (0, ?, ?, 'ACTIF')
    `, [dateInitialisation, initialisePar || 'Utilisateur'], (err, result) => {
      if (err) {
        console.error("Erreur initialisation code jour:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Code du jour initialisé' });
    });
  });
});

// Route pour réinitialiser le code du jour
app.post('/api/code-jour/reset', (req, res) => {
  pool.query("UPDATE code_jour SET STATUT = 'INACTIF' WHERE STATUT = 'ACTIF'", (err) => {
    if (err) {
      console.error("Erreur réinitialisation code jour:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Code du jour réinitialisé' });
  });
});

// Route pour incrémenter le code du jour (appelée après chaque codification)
app.post('/api/code-jour/increment', (req, res) => {
  pool.query(`
    UPDATE code_jour 
    SET CODE_JOUR = CODE_JOUR + 1 
    WHERE STATUT = 'ACTIF'
  `, (err, result) => {
    if (err) {
      console.error("Erreur incrémentation code jour:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Récupérer le nouveau code
    pool.query(`
      SELECT CODE_JOUR as codeJour 
      FROM code_jour 
      WHERE STATUT = 'ACTIF' 
      LIMIT 1
    `, (err, results) => {
      if (err) {
        console.error("Erreur récupération nouveau code:", err);
        return res.status(500).json({ error: err.message });
      }
      const newCode = results.length > 0 ? results[0].codeJour : 0;
      res.json({ success: true, newCode });
    });
  });
});

// Route pour vérifier si un lot a déjà un 1er code
app.get('/api/codes-secrets/lot/:lotId/premier-code', (req, res) => {
  const { lotId } = req.params;
  
  pool.query(`
    SELECT COUNT(*) as count
    FROM registre_codification rc
    JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    WHERE rs.ID_Lot = ? AND rc.LIBELLE_CODIFICATION = '1er code'
  `, [lotId], (err, results) => {
    if (err) {
      console.error("Erreur vérification 1er code:", err);
      return res.json({ hasPremierCode: false });
    }
    res.json({ hasPremierCode: results[0].count > 0 });
  });
});

// Route pour compter les reprises d'un lot
app.get('/api/codes-secrets/lot/:lotId/reprises-count', (req, res) => {
  const { lotId } = req.params;
  
  pool.query(`
    SELECT COUNT(*) as count
    FROM registre_codification rc
    JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    WHERE rs.ID_Lot = ? AND rc.LIBELLE_CODIFICATION = 'Reprise'
  `, [lotId], (err, results) => {
    if (err) {
      console.error("Erreur comptage reprises:", err);
      return res.json({ count: 0 });
    }
    res.json({ count: results[0].count || 0 });
  });
});

// Route pour générer le 1er code pour un lot
app.post('/api/codes-secrets/generer-premier', async (req, res) => {
  const { lotId } = req.body;
  
  console.log('Génération 1er code pour lot:', lotId);
  
  try {
    // 1. Vérifier si le lot existe et est sondé
    const lotCheck = await new Promise((resolve, reject) => {
      pool.query(`
        SELECT 
          l.ID_LOTS,
          l.NUM_LOTS,
          l.ETAT_SONDAGE_LOTS,
          rs.ID_SONDAGE,
          p.LIBELLE_PRODUIT,
          e.RAISONSOCIALE_EXPORTATEUR
        FROM lots l
        LEFT JOIN resgistre_sondage rs ON l.ID_LOTS = rs.ID_Lot
        LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
        LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
        LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
        WHERE l.ID_LOTS = ? AND l.ETAT_SONDAGE_LOTS = 'OUI'
        LIMIT 1
      `, [lotId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Lot check:', lotCheck);
    
    if (lotCheck.length === 0) {
      return res.status(400).json({ error: 'Lot non trouvé ou non sondé' });
    }
    
    // 2. Vérifier si un 1er code existe déjà
    const premierCodeCheck = await new Promise((resolve, reject) => {
      pool.query(`
        SELECT COUNT(*) as count
        FROM registre_codification rc
        WHERE rc.ID_SONDAGE = ? AND rc.LIBELLE_CODIFICATION = '1er code'
      `, [lotCheck[0].ID_SONDAGE], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('1er code check:', premierCodeCheck);
    
    if (premierCodeCheck[0].count > 0) {
      return res.status(400).json({ error: 'Un 1er code existe déjà pour ce lot' });
    }
    
    // 3. Récupérer le code du jour actuel et l'incrémenter
    const codeJourResult = await new Promise((resolve, reject) => {
      pool.query(`
        SELECT CODE_JOUR as codeJour 
        FROM code_jour 
        WHERE STATUT = 'ACTIF' 
        LIMIT 1
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Code jour:', codeJourResult);
    
    if (codeJourResult.length === 0) {
      return res.status(400).json({ error: 'Aucun code du jour actif. Initialisez d\'abord le code du jour.' });
    }
    
    const compteurEchantillons = codeJourResult[0].codeJour + 1;
    
    // 4. Générer le code secret selon le format
    const maintenant = new Date();
    const derniereAnnee = maintenant.getFullYear().toString().slice(-1);
    const debutAnnee = new Date(maintenant.getFullYear(), 0, 0);
    const jourDeLAnnee = Math.floor((maintenant.getTime() - debutAnnee.getTime()) / 86400000);
    const jourFormate = jourDeLAnnee.toString().padStart(3, '0');
    const echantillonFormate = compteurEchantillons.toString().padStart(3, '0');
    const codeSecret = `${derniereAnnee}${jourFormate}${echantillonFormate}`;
    
    console.log('Code généré:', codeSecret);
    
    // 5. Insérer dans registre_codification - UTILISER NULL POUR CODE_CODIFICATEUR
    const insertResult = await new Promise((resolve, reject) => {
      pool.query(`
        INSERT INTO registre_codification (
          LIBELLE_CODIFICATION,
          CODE_SECRET_CODIFICATION,
          DATE_ENREG_CODIFICATION,
          CODE_CODIFICATEUR,
          ETAT_CODIFICATION,
          ID_SONDAGE
        ) VALUES (?, ?, NOW(), NULL, 1, ?)
      `, ['1er code', codeSecret, lotCheck[0].ID_SONDAGE], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    // 6. Mettre à jour l'état de codification du lot
    await new Promise((resolve, reject) => {
      pool.query(`
        UPDATE lots 
        SET ETAT_CODIFICATION_LOTS = 'OUI' 
        WHERE ID_LOTS = ?
      `, [lotId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 7. Incrémenter le code du jour
    await new Promise((resolve, reject) => {
      pool.query(`
        UPDATE code_jour 
        SET CODE_JOUR = CODE_JOUR + 1 
        WHERE STATUT = 'ACTIF'
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('1er code généré avec succès:', codeSecret);
    
    res.json({ 
      success: true, 
      codeSecret, 
      message: '1er code généré avec succès',
      produit: lotCheck[0].LIBELLE_PRODUIT,
      exportateur: lotCheck[0].RAISONSOCIALE_EXPORTATEUR
    });
    
  } catch (error) {
    console.error("Erreur génération 1er code:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour générer une reprise
app.post('/api/codes-secrets/generer-reprise', async (req, res) => {
  const { lotId } = req.body;
  
  console.log('Génération reprise pour lot:', lotId);
  
  try {
    // 1. Vérifier si le lot existe
    const lotCheck = await new Promise((resolve, reject) => {
      pool.query(`
        SELECT 
          l.ID_LOTS,
          l.NUM_LOTS,
          rs.ID_SONDAGE,
          p.LIBELLE_PRODUIT,
          e.RAISONSOCIALE_EXPORTATEUR
        FROM lots l
        LEFT JOIN resgistre_sondage rs ON l.ID_LOTS = rs.ID_Lot
        LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
        LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
        LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
        WHERE l.ID_LOTS = ?
        LIMIT 1
      `, [lotId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Lot check:', lotCheck);
    
    if (lotCheck.length === 0) {
      return res.status(400).json({ error: 'Lot non trouvé' });
    }
    
    // Vérifier s'il y a un 1er code
    const premierCodeCheck = await new Promise((resolve, reject) => {
      pool.query(`
        SELECT COUNT(*) as count
        FROM registre_codification rc
        WHERE rc.ID_SONDAGE = ? AND rc.LIBELLE_CODIFICATION = '1er code'
      `, [lotCheck[0].ID_SONDAGE], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('1er code check:', premierCodeCheck);
    
    if (premierCodeCheck[0].count === 0) {
      return res.status(400).json({ error: 'Ce lot n\'a pas encore de 1er code' });
    }
    
    // 2. Récupérer le code du jour actuel et l'incrémenter
    const codeJourResult = await new Promise((resolve, reject) => {
      pool.query(`
        SELECT CODE_JOUR as codeJour 
        FROM code_jour 
        WHERE STATUT = 'ACTIF' 
        LIMIT 1
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Code jour:', codeJourResult);
    
    if (codeJourResult.length === 0) {
      return res.status(400).json({ error: 'Aucun code du jour actif' });
    }
    
    const compteurEchantillons = codeJourResult[0].codeJour + 1;
    
    // 3. Générer le code secret
    const maintenant = new Date();
    const derniereAnnee = maintenant.getFullYear().toString().slice(-1);
    const debutAnnee = new Date(maintenant.getFullYear(), 0, 0);
    const jourDeLAnnee = Math.floor((maintenant.getTime() - debutAnnee.getTime()) / 86400000);
    const jourFormate = jourDeLAnnee.toString().padStart(3, '0');
    const echantillonFormate = compteurEchantillons.toString().padStart(3, '0');
    const codeSecret = `${derniereAnnee}${jourFormate}${echantillonFormate}`;
    
    console.log('Code généré:', codeSecret);
    
    // 4. Insérer la reprise - UTILISER NULL POUR CODE_CODIFICATEUR
    const insertResult = await new Promise((resolve, reject) => {
      pool.query(`
        INSERT INTO registre_codification (
          LIBELLE_CODIFICATION,
          CODE_SECRET_CODIFICATION,
          DATE_ENREG_CODIFICATION,
          CODE_CODIFICATEUR,
          ETAT_CODIFICATION,
          ID_SONDAGE
        ) VALUES (?, ?, NOW(), NULL, 1, ?)
      `, ['Reprise', codeSecret, lotCheck[0].ID_SONDAGE], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    // 5. Incrémenter le code du jour
    await new Promise((resolve, reject) => {
      pool.query(`
        UPDATE code_jour 
        SET CODE_JOUR = CODE_JOUR + 1 
        WHERE STATUT = 'ACTIF'
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 6. Compter le nombre de reprises
    const countReprises = await new Promise((resolve, reject) => {
      pool.query(`
        SELECT COUNT(*) as count
        FROM registre_codification rc
        WHERE rc.ID_SONDAGE = ? AND rc.LIBELLE_CODIFICATION = 'Reprise'
      `, [lotCheck[0].ID_SONDAGE], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Reprise générée avec succès:', codeSecret);
    
    res.json({ 
      success: true, 
      codeSecret, 
      message: 'Reprise générée avec succès',
      nombreReprises: countReprises[0].count,
      produit: lotCheck[0].LIBELLE_PRODUIT,
      exportateur: lotCheck[0].RAISONSOCIALE_EXPORTATEUR
    });
    
  } catch (error) {
    console.error("Erreur génération reprise:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour générer des codes pour plusieurs lots sélectionnés
app.post('/api/codes-secrets/generer-selection', async (req, res) => {
  const { lotsIds } = req.body;
  
  console.log('Génération codes pour lots:', lotsIds);
  
  if (!lotsIds || !Array.isArray(lotsIds) || lotsIds.length === 0) {
    return res.status(400).json({ error: 'Aucun lot sélectionné' });
  }
  
  try {
    const codesGeneres = [];
    const erreurs = [];
    
    for (const lotId of lotsIds) {
      console.log('Traitement du lot ID:', lotId);
      
      try {
        // Vérifier si le lot est sondé
        const lotSondeCheck = await new Promise((resolve, reject) => {
          pool.query(`
            SELECT ETAT_SONDAGE_LOTS 
            FROM lots 
            WHERE ID_LOTS = ?
          `, [lotId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        if (lotSondeCheck.length === 0) {
          console.log(`Lot ${lotId} non trouvé`);
          erreurs.push(`Lot ${lotId}: non trouvé`);
          continue;
        }
        
        if (lotSondeCheck[0].ETAT_SONDAGE_LOTS !== 'OUI') {
          console.log(`Lot ${lotId} non sondé: ${lotSondeCheck[0].ETAT_SONDAGE_LOTS}`);
          erreurs.push(`Lot ${lotId}: non sondé`);
          continue;
        }
        
        // Vérifier si le lot a déjà un 1er code
        const premierCodeCheck = await new Promise((resolve, reject) => {
          pool.query(`
            SELECT COUNT(*) as count
            FROM registre_codification rc
            JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
            WHERE rs.ID_Lot = ? AND rc.LIBELLE_CODIFICATION = '1er code'
          `, [lotId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        console.log(`Lot ${lotId} - a déjà 1er code: ${premierCodeCheck[0].count}`);
        
        // Si pas de 1er code, on en génère un
        if (premierCodeCheck[0].count === 0) {
          // Récupérer les infos du lot
          const lotInfo = await new Promise((resolve, reject) => {
            pool.query(`
              SELECT 
                l.ID_LOTS,
                rs.ID_SONDAGE,
                p.LIBELLE_PRODUIT,
                e.RAISONSOCIALE_EXPORTATEUR
              FROM lots l
              LEFT JOIN resgistre_sondage rs ON l.ID_LOTS = rs.ID_Lot
              LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
              LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
              LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
              WHERE l.ID_LOTS = ? AND l.ETAT_SONDAGE_LOTS = 'OUI'
              LIMIT 1
            `, [lotId], (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });
          
          if (lotInfo.length > 0) {
            console.log(`Infos lot ${lotId} trouvées:`, lotInfo[0]);
            
            // Vérifier si le lot a un enregistrement de sondage
            if (!lotInfo[0].ID_SONDAGE) {
              console.log(`Lot ${lotId} n'a pas d'enregistrement de sondage`);
              erreurs.push(`Lot ${lotId}: pas d'enregistrement de sondage`);
              continue;
            }
            
            // Récupérer le code du jour
            const codeJourResult = await new Promise((resolve, reject) => {
              pool.query(`
                SELECT CODE_JOUR as codeJour 
                FROM code_jour 
                WHERE STATUT = 'ACTIF' 
                LIMIT 1
              `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });
            
            console.log(`Code jour:`, codeJourResult);
            
            if (codeJourResult.length > 0) {
              const compteurEchantillons = codeJourResult[0].codeJour + 1;
              
              // Générer le code
              const maintenant = new Date();
              const derniereAnnee = maintenant.getFullYear().toString().slice(-1);
              const debutAnnee = new Date(maintenant.getFullYear(), 0, 0);
              const jourDeLAnnee = Math.floor((maintenant.getTime() - debutAnnee.getTime()) / 86400000);
              const jourFormate = jourDeLAnnee.toString().padStart(3, '0');
              const echantillonFormate = compteurEchantillons.toString().padStart(3, '0');
              const codeSecret = `${derniereAnnee}${jourFormate}${echantillonFormate}`;
              
              console.log(`Code généré pour lot ${lotId}: ${codeSecret}`);
              
              // Insérer le code - UTILISER NULL POUR CODE_CODIFICATEUR
              await new Promise((resolve, reject) => {
                pool.query(`
                  INSERT INTO registre_codification (
                    LIBELLE_CODIFICATION,
                    CODE_SECRET_CODIFICATION,
                    DATE_ENREG_CODIFICATION,
                    CODE_CODIFICATEUR,
                    ETAT_CODIFICATION,
                    ID_SONDAGE
                  ) VALUES (?, ?, NOW(), NULL, 1, ?)
                `, ['1er code', codeSecret, lotInfo[0].ID_SONDAGE], (err) => {
                  if (err) {
                    console.error(`Erreur insertion code pour lot ${lotId}:`, err);
                    reject(err);
                  } else {
                    console.log(`Code inséré pour lot ${lotId}`);
                    resolve();
                  }
                });
              });
              
              // Mettre à jour le lot
              await new Promise((resolve, reject) => {
                pool.query(`
                  UPDATE lots 
                  SET ETAT_CODIFICATION_LOTS = 'OUI' 
                  WHERE ID_LOTS = ?
                `, [lotId], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
              
              // Incrémenter le code du jour
              await new Promise((resolve, reject) => {
                pool.query(`
                  UPDATE code_jour 
                  SET CODE_JOUR = CODE_JOUR + 1 
                  WHERE STATUT = 'ACTIF'
                `, (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
              
              codesGeneres.push({ 
                lotId, 
                codeSecret, 
                type: '1er code',
                produit: lotInfo[0].LIBELLE_PRODUIT
              });
            } else {
              console.log(`Aucun code du jour actif pour lot ${lotId}`);
              erreurs.push(`Lot ${lotId}: code du jour non actif`);
            }
          } else {
            console.log(`Aucune info trouvée pour lot ${lotId}`);
            erreurs.push(`Lot ${lotId}: informations non trouvées`);
          }
        } else {
          console.log(`Lot ${lotId} a déjà un 1er code`);
          erreurs.push(`Lot ${lotId}: a déjà un 1er code`);
        }
      } catch (error) {
        console.error(`Erreur avec lot ${lotId}:`, error);
        erreurs.push(`Lot ${lotId}: ${error.message}`);
        // Continuer avec les autres lots
      }
    }
    
    console.log('Codes générés:', codesGeneres);
    console.log('Erreurs:', erreurs);
    
    res.json({ 
      success: true, 
      codesGeneres,
      erreurs,
      message: `${codesGeneres.length} code(s) généré(s) avec succès sur ${lotsIds.length} lot(s) sélectionné(s)` 
    });
    
  } catch (error) {
    console.error("Erreur génération codes sélection:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour générer des reprises pour plusieurs lots sélectionnés
app.post('/api/codes-secrets/generer-reprises-selection', async (req, res) => {
  const { lotsIds } = req.body;
  
  console.log('Génération reprises pour lots:', lotsIds);
  
  if (!lotsIds || !Array.isArray(lotsIds) || lotsIds.length === 0) {
    return res.status(400).json({ error: 'Aucun lot sélectionné' });
  }
  
  try {
    const codesGeneres = [];
    const erreurs = [];
    
    for (const lotId of lotsIds) {
      console.log('Traitement du lot ID pour reprise:', lotId);
      
      try {
        // Vérifier si le lot a un 1er code
        const premierCodeCheck = await new Promise((resolve, reject) => {
          pool.query(`
            SELECT COUNT(*) as count
            FROM registre_codification rc
            JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
            WHERE rs.ID_Lot = ? AND rc.LIBELLE_CODIFICATION = '1er code'
          `, [lotId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        if (premierCodeCheck[0].count === 0) {
          console.log(`Lot ${lotId} n'a pas de 1er code`);
          erreurs.push(`Lot ${lotId}: pas de 1er code (générez d'abord un 1er code)`);
          continue;
        }
        
        // Récupérer les infos du lot
        const lotInfo = await new Promise((resolve, reject) => {
          pool.query(`
            SELECT 
              l.ID_LOTS,
              rs.ID_SONDAGE,
              p.LIBELLE_PRODUIT,
              e.RAISONSOCIALE_EXPORTATEUR
            FROM lots l
            LEFT JOIN resgistre_sondage rs ON l.ID_LOTS = rs.ID_Lot
            LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
            LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
            LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
            WHERE l.ID_LOTS = ?
            LIMIT 1
          `, [lotId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        if (lotInfo.length > 0) {
          console.log(`Infos lot ${lotId} trouvées pour reprise:`, lotInfo[0]);
          
          // Vérifier si le lot a un enregistrement de sondage
          if (!lotInfo[0].ID_SONDAGE) {
            console.log(`Lot ${lotId} n'a pas d'enregistrement de sondage`);
            erreurs.push(`Lot ${lotId}: pas d'enregistrement de sondage`);
            continue;
          }
          
          // Récupérer le code du jour
          const codeJourResult = await new Promise((resolve, reject) => {
            pool.query(`
              SELECT CODE_JOUR as codeJour 
              FROM code_jour 
              WHERE STATUT = 'ACTIF' 
              LIMIT 1
            `, (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });
          
          if (codeJourResult.length > 0) {
            const compteurEchantillons = codeJourResult[0].codeJour + 1;
            
            // Générer le code
            const maintenant = new Date();
            const derniereAnnee = maintenant.getFullYear().toString().slice(-1);
            const debutAnnee = new Date(maintenant.getFullYear(), 0, 0);
            const jourDeLAnnee = Math.floor((maintenant.getTime() - debutAnnee.getTime()) / 86400000);
            const jourFormate = jourDeLAnnee.toString().padStart(3, '0');
            const echantillonFormate = compteurEchantillons.toString().padStart(3, '0');
            const codeSecret = `${derniereAnnee}${jourFormate}${echantillonFormate}`;
            
            console.log(`Code reprise généré pour lot ${lotId}: ${codeSecret}`);
            
            // Insérer la reprise - UTILISER NULL POUR CODE_CODIFICATEUR
            await new Promise((resolve, reject) => {
              pool.query(`
                INSERT INTO registre_codification (
                  LIBELLE_CODIFICATION,
                  CODE_SECRET_CODIFICATION,
                  DATE_ENREG_CODIFICATION,
                  CODE_CODIFICATEUR,
                  ETAT_CODIFICATION,
                  ID_SONDAGE
                ) VALUES (?, ?, NOW(), NULL, 1, ?)
              `, ['Reprise', codeSecret, lotInfo[0].ID_SONDAGE], (err) => {
                if (err) {
                  console.error(`Erreur insertion reprise pour lot ${lotId}:`, err);
                  reject(err);
                } else {
                  console.log(`Reprise insérée pour lot ${lotId}`);
                  resolve();
                }
              });
            });
            
            // Incrémenter le code du jour
            await new Promise((resolve, reject) => {
              pool.query(`
                UPDATE code_jour 
                SET CODE_JOUR = CODE_JOUR + 1 
                WHERE STATUT = 'ACTIF'
              `, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            
            // Compter le nombre de reprises
            const countReprises = await new Promise((resolve, reject) => {
              pool.query(`
                SELECT COUNT(*) as count
                FROM registre_codification rc
                WHERE rc.ID_SONDAGE = ? AND rc.LIBELLE_CODIFICATION = 'Reprise'
              `, [lotInfo[0].ID_SONDAGE], (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });
            
            codesGeneres.push({ 
              lotId, 
              codeSecret, 
              type: 'Reprise',
              nombreReprises: countReprises[0].count,
              produit: lotInfo[0].LIBELLE_PRODUIT
            });
          } else {
            console.log(`Aucun code du jour actif pour lot ${lotId}`);
            erreurs.push(`Lot ${lotId}: code du jour non actif`);
          }
        } else {
          console.log(`Aucune info trouvée pour lot ${lotId}`);
          erreurs.push(`Lot ${lotId}: informations non trouvées`);
        }
      } catch (error) {
        console.error(`Erreur avec lot ${lotId}:`, error);
        erreurs.push(`Lot ${lotId}: ${error.message}`);
      }
    }
    
    console.log('Reprises générées:', codesGeneres);
    console.log('Erreurs:', erreurs);
    
    res.json({ 
      success: true, 
      codesGeneres,
      erreurs,
      message: `${codesGeneres.length} reprise(s) générée(s) avec succès sur ${lotsIds.length} lot(s) sélectionné(s)` 
    });
    
  } catch (error) {
    console.error("Erreur génération reprises sélection:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour imprimer un code (UNE SEULE PAGE)
app.post('/api/codes-secrets/imprimer', (req, res) => {
  const { codeSecret } = req.body;
  
  if (!codeSecret) {
    return res.status(400).json({ error: 'Code secret manquant' });
  }
  
  // Récupérer les infos du code
  pool.query(`
    SELECT 
      rc.ID_CODIFICATION,
      rc.CODE_SECRET_CODIFICATION,
      rc.DATE_ENREG_CODIFICATION,
      rc.LIBELLE_CODIFICATION,
      p.LIBELLE_PRODUIT,
      l.NUM_LOTS,
      e.RAISONSOCIALE_EXPORTATEUR as exportateur
    FROM registre_codification rc
    LEFT JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    LEFT JOIN lots l ON rs.ID_Lot = l.ID_LOTS
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    WHERE rc.ID_CODIFICATION = ?
    LIMIT 1
  `, [codeSecret.ID_CODIFICATION], (err, results) => {
    if (err) {
      console.error("Erreur récupération infos code:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Code non trouvé' });
    }
    
    const codeInfo = results[0];
    const date = new Date(codeInfo.DATE_ENREG_CODIFICATION);
    const dateFormatee = date.toLocaleDateString('fr-FR');
    const heureFormatee = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Générer le HTML pour l'impression - FORMAT SIMPLIFIÉ POUR 1 PAGE
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Code Secret - ${codeInfo.CODE_SECRET_CODIFICATION}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              page-break-after: always;
              page-break-inside: avoid;
            }
          }
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            background-color: white;
            position: relative;
          }
          .page-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
            position: relative;
          }
          .header {
            text-align: center;
            margin-bottom: 60px;
            width: 100%;
          }
          h1 {
            color: #0d2d53;
            font-size: 28px;
            margin: 0 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .date-info {
            color: #666;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .code-container {
            margin: 40px 0;
            padding: 40px 20px;
            background-color: #f8f9fa;
            border-radius: 15px;
            border: 3px solid #0d2d53;
            width: 80%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .code {
            font-size: 96px;
            font-weight: bold;
            letter-spacing: 15px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
            color: #0d2d53;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          }
          .product-info {
            margin: 40px 0;
            font-size: 20px;
            color: #333;
            line-height: 1.8;
            text-align: center;
            width: 80%;
          }
          .product-name {
            font-weight: bold;
            color: #0d2d53;
            font-size: 24px;
            margin: 15px 0;
            text-transform: uppercase;
          }
          .lot-info {
            font-size: 18px;
            color: #555;
            margin-top: 10px;
            font-style: italic;
          }
          .footer {
            position: absolute;
            bottom: 40px;
            width: 80%;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .type-badge {
            display: inline-block;
            background-color: ${codeInfo.LIBELLE_CODIFICATION === '1er code' ? '#28a745' : '#007bff'};
            color: white;
            padding: 10px 25px;
            border-radius: 25px;
            font-size: 18px;
            margin-top: 20px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .watermark {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: rgba(13, 45, 83, 0.1);
            font-size: 48px;
            font-weight: bold;
            transform: rotate(-45deg);
            user-select: none;
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header">
            <h1>CODE SECRET DE LABORATOIRE</h1>
            <div class="date-info">
              Code généré le ${dateFormatee} à ${heureFormatee}
            </div>
          </div>
          
          <div class="code-container">
            <div class="code">
              ${codeInfo.CODE_SECRET_CODIFICATION}
            </div>
            <div class="type-badge">
              ${codeInfo.LIBELLE_CODIFICATION}
            </div>
          </div>
          
          <div class="product-info">
            <div>Analyse effectuée sur du</div>
            <div class="product-name">${codeInfo.LIBELLE_PRODUIT || 'Produit non spécifié'}</div>
            <div class="lot-info">
              Lot: ${codeInfo.NUM_LOTS || 'Non spécifié'} | Exportateur: ${codeInfo.exportateur || 'Non spécifié'}
            </div>
          </div>
          
          <div class="footer">
            Document généré automatiquement par le système de codification<br>
            Ce code est unique et confidentiel - Ne pas dupliquer
          </div>
          
          <div class="watermark">
            LABORATOIRE
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;
    
    res.json({ html });
  });
});

// Route pour imprimer plusieurs codes (CHACUN SUR SA PROPRE PAGE)
app.post('/api/codes-secrets/imprimer-selection', (req, res) => {
  const { codesSecrets } = req.body;
  
  if (!codesSecrets || !Array.isArray(codesSecrets) || codesSecrets.length === 0) {
    return res.status(400).json({ error: 'Aucun code à imprimer' });
  }
  
  // Récupérer les infos de tous les codes
  const codesIds = codesSecrets.map(c => c.ID_CODIFICATION);
  
  pool.query(`
    SELECT 
      rc.ID_CODIFICATION,
      rc.CODE_SECRET_CODIFICATION,
      rc.DATE_ENREG_CODIFICATION,
      rc.LIBELLE_CODIFICATION,
      p.LIBELLE_PRODUIT,
      l.NUM_LOTS,
      e.RAISONSOCIALE_EXPORTATEUR as exportateur
    FROM registre_codification rc
    LEFT JOIN resgistre_sondage rs ON rc.ID_SONDAGE = rs.ID_SONDAGE
    LEFT JOIN lots l ON rs.ID_Lot = l.ID_LOTS
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    WHERE rc.ID_CODIFICATION IN (?)
    ORDER BY rc.DATE_ENREG_CODIFICATION DESC
  `, [codesIds], (err, results) => {
    if (err) {
      console.error("Erreur récupération infos codes:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Générer une page HTML pour chaque code
    let pagesHTML = '';
    
    results.forEach((codeInfo, index) => {
      const date = new Date(codeInfo.DATE_ENREG_CODIFICATION);
      const dateFormatee = date.toLocaleDateString('fr-FR');
      const heureFormatee = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      pagesHTML += `
        <div class="page">
          <div class="page-container">
            <div class="header">
              <h1>CODE SECRET DE LABORATOIRE</h1>
              <div class="date-info">
                Code généré le ${dateFormatee} à ${heureFormatee}
                <br>Code ${index + 1} sur ${results.length}
              </div>
            </div>
            
            <div class="code-container">
              <div class="code">
                ${codeInfo.CODE_SECRET_CODIFICATION}
              </div>
              <div class="type-badge">
                ${codeInfo.LIBELLE_CODIFICATION}
              </div>
            </div>
            
            <div class="product-info">
              <div>Analyse effectuée sur du</div>
              <div class="product-name">${codeInfo.LIBELLE_PRODUIT || 'Produit non spécifié'}</div>
              <div class="lot-info">
                Lot: ${codeInfo.NUM_LOTS || 'Non spécifié'} | Exportateur: ${codeInfo.exportateur || 'Non spécifié'}
              </div>
            </div>
            
            <div class="footer">
              Document généré automatiquement par le système de codification<br>
              Ce code est unique et confidentiel - Ne pas dupliquer
            </div>
            
            <div class="watermark">
              LABORATOIRE
            </div>
          </div>
        </div>
      `;
    });
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Impression Codes Secrets</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              page-break-after: always;
              page-break-inside: avoid;
              width: 210mm;
              height: 297mm;
            }
          }
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: white;
          }
          .page {
            width: 210mm;
            height: 297mm;
            position: relative;
          }
          .page-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
            position: relative;
          }
          .header {
            text-align: center;
            margin-bottom: 60px;
            width: 100%;
          }
          h1 {
            color: #0d2d53;
            font-size: 28px;
            margin: 0 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .date-info {
            color: #666;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .code-container {
            margin: 40px 0;
            padding: 40px 20px;
            background-color: #f8f9fa;
            border-radius: 15px;
            border: 3px solid #0d2d53;
            width: 80%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .code {
            font-size: 96px;
            font-weight: bold;
            letter-spacing: 15px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
            color: #0d2d53;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          }
          .product-info {
            margin: 40px 0;
            font-size: 20px;
            color: #333;
            line-height: 1.8;
            text-align: center;
            width: 80%;
          }
          .product-name {
            font-weight: bold;
            color: #0d2d53;
            font-size: 24px;
            margin: 15px 0;
            text-transform: uppercase;
          }
          .lot-info {
            font-size: 18px;
            color: #555;
            margin-top: 10px;
            font-style: italic;
          }
          .footer {
            position: absolute;
            bottom: 40px;
            width: 80%;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .type-badge {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 25px;
            border-radius: 25px;
            font-size: 18px;
            margin-top: 20px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .type-badge.premier {
            background-color: #28a745;
          }
          .watermark {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: rgba(13, 45, 83, 0.1);
            font-size: 48px;
            font-weight: bold;
            transform: rotate(-45deg);
            user-select: none;
          }
        </style>
      </head>
      <body>
        ${pagesHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    res.json({ html });
  });
});

// Route pour créer la table code_jour si elle n'existe pas
app.get('/api/init-database', (req, res) => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS code_jour (
      ID_CODE_JOUR INT PRIMARY KEY AUTO_INCREMENT,
      CODE_JOUR INT NOT NULL DEFAULT 0,
      DATE_INITIALISATION DATETIME NOT NULL,
      INITIALISE_PAR VARCHAR(100) NOT NULL,
      STATUT ENUM('ACTIF', 'INACTIF') DEFAULT 'INACTIF',
      DATE_CREATION TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `INSERT IGNORE INTO code_jour (CODE_JOUR, DATE_INITIALISATION, INITIALISE_PAR, STATUT) 
     VALUES (0, NOW(), 'SYSTEM', 'INACTIF')`
  ];
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Erreur connexion:", err);
      return res.status(500).json({ error: err.message });
    }
    
    let completed = 0;
    let errors = [];
    
    queries.forEach((query, index) => {
      connection.query(query, (err, results) => {
        if (err) {
          console.error(`Erreur query ${index}:`, err);
          errors.push(err.message);
        }
        
        completed++;
        if (completed === queries.length) {
          connection.release();
          if (errors.length > 0) {
            res.status(500).json({ error: 'Erreurs lors de l\'initialisation', details: errors });
          } else {
            res.json({ success: true, message: 'Base de données initialisée avec succès' });
          }
        }
      });
    });
  });
});

// Route pour récupérer les données de test
app.get('/api/test-data', (req, res) => {
  pool.query(`
    SELECT 
      l.ID_LOTS,
      l.NUM_LOTS,
      l.ETAT_SONDAGE_LOTS,
      l.ETAT_CODIFICATION_LOTS,
      rs.ID_SONDAGE,
      p.LIBELLE_PRODUIT,
      rc.CODE_SECRET_CODIFICATION,
      rc.LIBELLE_CODIFICATION as type_code
    FROM lots l
    LEFT JOIN resgistre_sondage rs ON l.ID_LOTS = rs.ID_Lot
    LEFT JOIN demandes d ON l.ID_DEMANDE = d.ID_DEMANDE
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN registre_codification rc ON rc.ID_SONDAGE = rs.ID_SONDAGE
    WHERE l.ETAT_SONDAGE_LOTS = 'OUI'
    LIMIT 10
  `, (err, results) => {
    if (err) {
      console.error("Erreur récupération données test:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
  console.log('=== Routes disponibles ===');
  console.log('=== Gestion des données ===');
  console.log('- GET  /api/exportateurs, /api/produits, /api/campagnes, /api/magasins');
  console.log('- GET  /api/demandes (avec filtres)');
  console.log('- GET  /api/sondage/lots (lots sondés)');
  console.log('- POST /api/lots/enregistrerSondage (enregistrer sondage)');
  console.log('');
  console.log('=== Gestion de la codification ===');
  console.log('- GET  /api/codes-secrets (codes générés) - param: ?lotIds=1,2,3');
  console.log('- GET  /api/code-jour/current (état code jour)');
  console.log('- POST /api/code-jour/initialize (initialiser code jour)');
  console.log('- POST /api/code-jour/reset (réinitialiser code jour)');
  console.log('- POST /api/codes-secrets/generer-premier (générer 1er code)');
  console.log('- POST /api/codes-secrets/generer-reprise (générer reprise)');
  console.log('- POST /api/codes-secrets/generer-selection (générer 1ers codes sélection)');
  console.log('- POST /api/codes-secrets/generer-reprises-selection (générer reprises sélection)');
  console.log('- POST /api/codes-secrets/imprimer (imprimer code - 1 page)');
  console.log('- POST /api/codes-secrets/imprimer-selection (imprimer sélection - 1 code par page)');
  console.log('');
  console.log('=== Analyses Laboratoire ===');
  console.log('- GET  /api/codes-secrets/valider/:code (valider code secret)');
  console.log('- POST /api/analyses/cacao (enregistrer analyse cacao - CORRIGÉ)');
  console.log('- POST /api/analyses/cafe (enregistrer analyse café)');
  console.log('');
  console.log('=== Utilitaires ===');
  console.log('- GET  /api/init-database (initialiser tables)');
  console.log('- GET  /api/test-data (données de test)');
  console.log('=== Gestion des résultats d\'analyses ===');
console.log('- GET  /api/analyses/cacao (récupérer analyses avec filtres)');
console.log('- GET  /api/analyses/:id (récupérer une analyse spécifique)');
console.log('- POST /api/analyses/valider (valider/rejeter analyses)');
console.log('- PUT  /api/analyses/:id (modifier une analyse)');
console.log('- DELETE /api/analyses/:id (supprimer une analyse)');
  console.log('');
  console.log('====================================');
});