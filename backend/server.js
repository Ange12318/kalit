const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'base_qualite',
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error('Erreur connexion MySQL:', err);
    process.exit(1);
  }
  console.log('Connecté à MySQL - base_qualite');
});

// === Toutes les routes GET ===
app.get('/api/exportateurs', (req, res) => {
  db.query("SELECT ID_EXPORTATEUR as id, RAISONSOCIALE_EXPORTATEUR as nom, MARQUE_EXPORTATEUR as marque FROM exportateurs ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur exportateurs:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

app.get('/api/produits', (req, res) => {
  db.query("SELECT ID_PRODUIT as id, LIBELLE_PRODUIT as nom FROM produits ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur produits:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

app.get('/api/campagnes', (req, res) => {
  db.query("SELECT CAMP_DEMANDE as nom FROM campagne ORDER BY CAMP_DEMANDE DESC", (err, results) => {
    if (err) {
      console.error("Erreur campagnes:", err);
      return res.json([]);
    }
    res.json(results ? results.map(r => ({ nom: r.nom })) : []);
  });
});

app.get('/api/magasins', (req, res) => {
  db.query("SELECT ID_MAGASIN as id, NOM_MAGASIN as nom FROM magasins ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur magasins:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route pour récupérer les marques
app.get('/api/marques', (req, res) => {
  db.query("SELECT ID_MARQUE as id, LIBELLE_MARQUE as nom FROM marques ORDER BY nom", (err, results) => {
    if (err) {
      console.error("Erreur marques:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route grades
app.get('/api/grades', (req, res) => {
  db.query(
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

// Nouvelle route pour les postes de contrôle
app.get('/api/postes-controle', (req, res) => {
  db.query(
    "SELECT CODE_POSTE_CONTROLE as code, VILLE_POSTE_CONTROLE as ville, LIBELLE_POSTE_CONTROLE as libelle, RESPONSBLE_POSTE_CONTROLE as responsable, ETAT_POSTE_CONTROLE as etat FROM poste_controle ORDER BY ville",
    (err, results) => {
      if (err) {
        console.error("Erreur postes-controle:", err);
        return res.json([]);
      }
      res.json(results || []);
    }
  );
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
    sql += " AND e.VILLE_EXPORTATEUR = ?"; 
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
  db.query(sql, params, (err, results) => {
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
  db.query(`
    SELECT 
      d.*, 
      p.LIBELLE_PRODUIT, 
      e.RAISONSOCIALE_EXPORTATEUR,
      e.MARQUE_EXPORTATEUR,
      e.VILLE_EXPORTATEUR
    FROM demandes d
    LEFT JOIN produits p ON d.ID_PRODUIT = p.ID_PRODUIT
    LEFT JOIN exportateurs e ON d.ID_EXPORTATEUR = e.ID_EXPORTATEUR
    WHERE d.ID_DEMANDE = ?
  `, [id], (err, results) => { // <-- Correction de la syntaxe
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
  db.query(`
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

// === ROUTES POUR LE SONDAGE ===

// Route pour récupérer les lots avec filtres pour le sondage
app.get('/api/sondage/lots', (req, res) => {
  const { reference, numeroLot, exportateur, produit, recolte, ville, dateDebut, dateFin } = req.query;
  
  let sql = `
    SELECT 
      l.ID_LOTS,
      l.NUM_LOTS,
      d.REF_DEMANDE,
      p.LIBELLE_PRODUIT,
      e.VILLE_EXPORTATEUR,
      e.RAISONSOCIALE_EXPORTATEUR,
      d.DATEREC_DEMANDE,
      l.RECOLTE_LOTS,
      mg.NOM_MAGASIN,
      l.ID_GRADE,
      l.ETAT_SONDAGE_LOTS
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
    sql += " AND e.VILLE_EXPORTATEUR = ?";
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
  
  sql += " ORDER BY l.ID_LOTS DESC LIMIT 100";
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erreur recherche lots sondage:", err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// Route pour valider la décision de sondage (sans détails)
app.post('/api/sondage/valider', (req, res) => {
  const { lotsIds, decision } = req.body;
  
  if (!lotsIds || !Array.isArray(lotsIds) || lotsIds.length === 0) {
    return res.status(400).json({ error: "Liste des lots invalide" });
  }
  
  // On utilise 'OUI'/'NON' pour le champ ETAT_SONDAGE_LOTS dans la table lots
  const statutSondage = decision === 'Oui' ? 'OUI' : 'NON'; 
  const placeholders = lotsIds.map(() => '?').join(',');
  
  const sql = `UPDATE lots SET ETAT_SONDAGE_LOTS = ? WHERE ID_LOTS IN (${placeholders})`;
  
  db.query(sql, [statutSondage, ...lotsIds], (err, result) => {
    if (err) {
      console.error("Erreur mise à jour statut sondage:", err);
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ 
      success: true, 
      message: `${result.affectedRows} lot(s) mis à jour avec succès`,
      statut: statutSondage
    });
  });
});

// ===============================================
// === Route POST pour l'enregistrement du sondage d'un ou plusieurs lots ===
// (Correction finale appliquée à CODE_SONDEUR)
// ===============================================
app.post('/api/lots/enregistrerSondage', (req, res) => {
  const {
    lotIds, // Tableau d'ID des lots sondés
    dateSondage,
    codeSondeur, // Le code de l'utilisateur qui effectue le sondage
    observationSondage,
    decisionSondage, // 'Oui' ou 'Non'
    nbreEchanSondage,
    poidsTotalSondage,
  } = req.body;

  // Fonction pour garantir qu'un champ optionnel est NULL si vide
  const toNullable = (value) => {
    return (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) ? null : value;
  };

  if (!lotIds || lotIds.length === 0 || !dateSondage || !codeSondeur) {
    return res.status(400).json({ error: "Données manquantes pour l'enregistrement du sondage (lotIds, dateSondage, codeSondeur requis)." });
  }

  // Conversion de la décision pour les deux tables
  // ETAT_SONDAGE (resgistre_sondage): 1/0
  const etatSondage = decisionSondage === 'Oui' ? 1 : 0;
  // ETAT_SONDAGE_LOTS (lots): 'OUI'/'NON'
  const statutLot = decisionSondage === 'Oui' ? 'OUI' : 'NON';

  // Application de la fonction de nettoyage pour les champs optionnels (FLOAT/TEXT)
  const cleanedNbreEchan = toNullable(nbreEchanSondage);
  const cleanedPoidsTotal = toNullable(poidsTotalSondage);
  const cleanedObservation = toNullable(observationSondage);
  
  // FIX: Application de la fonction de nettoyage à codeSondeur, car c'est un INT (DB)
  // et pourrait être envoyé comme une chaîne vide malgré la validation initiale.
  const cleanedCodeSondeur = toNullable(codeSondeur);


  // Utilisation d'une transaction pour garantir l'atomicité
  db.getConnection((err, connection) => {
    if (err) {
      console.error("ERREUR CRITIQUE DE CONNEXION DB:", err);
      return res.status(500).json({ error: "Erreur de connexion à la base de données." });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        console.error("ERREUR DÉBUT TRANSACTION:", err);
        return res.status(500).json({ error: "Erreur de démarrage de la transaction." });
      }

      try {
        const lotOperations = lotIds.map(idLot => {
          return new Promise((resolve, reject) => {
            // 1. Mise à jour de l'ETAT_SONDAGE_LOTS dans la table lots
            const sqlUpdateLot = "UPDATE lots SET ETAT_SONDAGE_LOTS = ? WHERE ID_LOTS = ?";
            
            connection.query(sqlUpdateLot, [statutLot, idLot], (err) => {
              if (err) return reject(err);
              
              // 2. Insertion dans la table resgistre_sondage
              const sqlInsertSondage = `
                INSERT INTO resgistre_sondage 
                (ID_LOT, DATE_SONDAGE_LOT, CODE_SONDEUR_SONDAGE, OBSERVATION_SONDAGE, ETAT_SONDAGE, NBRE_ECHAN_SONDAGE, POIDS_TOTAL_SONDAGE) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `;
              const values = [
                idLot,
                dateSondage,
                cleanedCodeSondeur, // UTILISATION DE LA VALEUR NETTOYÉE
                cleanedObservation,
                etatSondage,
                cleanedNbreEchan,
                cleanedPoidsTotal
              ];

              // LOG DE DÉBOGAGE DES VALEURS AVANT INSERTION
              console.log(`[DEBUG] Insertion Lot ${idLot}. Valeurs:`, values);

              connection.query(sqlInsertSondage, values, (err) => {
                if (err) {
                    // LOG DE DÉBOGAGE DE L'ERREUR D'INSERTION
                    console.error(`[ERREUR INSERTION resgistre_sondage pour Lot ${idLot}]`, err);
                    return reject(err);
                }
                resolve();
              });
            });
          });
        });

        // Exécuter toutes les opérations
        await Promise.all(lotOperations);

        // Si tout est OK, commiter la transaction
        connection.commit(err => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              throw err;
            });
          }
          connection.release();
          console.log(`Sondage enregistré et lots mis à jour pour ${lotIds.length} lot(s).`);
          res.json({ success: true, message: `Sondage enregistré pour ${lotIds.length} lot(s).` });
        });

      } catch (error) {
        // CE BLOC EST EXÉCUTÉ SI UNE ERREUR SQL SE PRODUIT
        console.error("ERREUR LORS DE L'OPÉRATION D'ENREGISTREMENT DU SONDAGE (ROLLBACK):", error);
        connection.rollback(() => {
          connection.release();
          // Retourne l'erreur à l'utilisateur pour le débogage
          res.status(500).json({ error: "Échec de l'enregistrement du sondage. Erreur DB: " + error.message });
        });
      }
    });
  });
});
// Route pour supprimer une demande
app.delete('/api/demandes/:id', (req, res) => {
  const { id } = req.params;
  
  // D'abord supprimer les lots associés
  db.query('DELETE FROM lots WHERE ID_DEMANDE = ?', [id], (err) => {
    if (err) {
      console.error("Erreur suppression lots:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Puis supprimer la demande
    db.query('DELETE FROM demandes WHERE ID_DEMANDE = ?', [id], (err, result) => {
      if 
      (err) {
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
  db.beginTransaction(err => {
    if (err) {
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
        DATE_EXPIR_DEMANDE = ?
      WHERE ID_DEMANDE = ?
    `;

    db.query(sqlUpdateDemande, [
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
      id
    ], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("Erreur mise à jour demande:", err);
          res.status(500).json({ error: err.message });
        });
      }

      // Supprimer les anciens lots
      db.query('DELETE FROM lots WHERE ID_DEMANDE = ?', [id], err => {
        if (err) {
          return db.rollback(() => {
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
                    db.query('SELECT ID_MAGASIN FROM magasins WHERE NOM_MAGASIN = ?', [lot.magasin], (err, results) => {
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
                    db.query('SELECT ID_MARQUE FROM marques WHERE LIBELLE_MARQUE = ?', [lot.marque], (err, results) => {
                      if 
                      (err) {
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
                db.query(sqlLot, [
                  lot.numero || '',
                  lot.nbreSacs || 0,
                  lot.poids || 0,
                  lot.recolte || null,
                  null, 
                  // origine
                  lot.qualite || null,
                  entrepotId, // ID_ENTREPOT
                  marqueId,
                  id,
                  0, // analyse_lots
                  lot.parite || '1' // STATUT_LOTS pour la parité
                ], (err) => {
                  if (err) {
                    console.error("Erreur insertion lot:", err);
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              };

              // Exécuter en séquence
              getEntrepotId()
                .then(() => getMarqueId())
                .then(() => insererLot())
                .catch(reject);
            });
          });

          Promise.all(lotPromises)
            .then(() => {
              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Erreur commit:", err);
                    res.status(500).json({ error: err.message });
                  });
                }
                res.json({ success: true, message: 'Demande modifiée avec succès' });
              });
            })
            .catch(error => {
              return db.rollback(() => {
                console.error("Erreur insertion nouveaux lots:", error);
                res.status(500).json({ error: error.message });
              });
            });
        } else {
          // Commit si pas de lots
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error("Erreur commit:", err);
                res.status(500).json({ error: err.message });
              });
            }
            res.json({ success: true, message: 'Demande modifiée avec succès' });
          });
        }
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
      NATURE_DEMANDE, CODE_NATURE_PRESTATION, DATE_EXPIR_DEMANDE, VALIDER_DEMANDE, ETAT_DEMANDE
    ) VALUES (?, ?, 'TYPE-A', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'En attente')
  `;

  db.query(sqlDemande, [
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
    b.dateExpiration || null
  ], (err, result) => {
    if (err) {
      console.error("Erreur insertion demande:", err);
      return res.status(500).json({ error: err.message });
    }

    const demandeId = result.insertId;
    console.log(`Demande créée avec ID: ${demandeId}`);
    if (b.lots && b.lots.length > 0) {
      const lotPromises = b.lots.map(lot => {
        return new Promise((resolve, reject) => {
          // Récupérer les IDs
          let entrepotId = null;
          let marqueId = null;

          const getEntrepotId = () => {
            return new Promise((resolveEntrepot) => 
            {
              if (lot.magasin) {
                db.query('SELECT ID_MAGASIN FROM magasins WHERE NOM_MAGASIN = ?', [lot.magasin], (err, results) => {
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
                db.query('SELECT ID_MARQUE FROM marques WHERE LIBELLE_MARQUE = ?', [lot.marque], (err, results) => {
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
              null, // origine
              lot.qualite || null,
              entrepotId, // ID_ENTREPOT (qui stocke l'ID du magasin)
              marqueId,
              demandeId,
              0, // analyse_lots
              lot.parite || '1' // STATUT_LOTS pour la parité
            ];
            console.log(`Insertion lot:`, values);

            db.query(sqlLot, values, (err) => {
              if (err) {
                console.error("Erreur insertion lot:", err);
                reject(err);
              } else {
                console.log(`Lot inséré avec succès: ${lot.numero}`);
                resolve();
              }
            });
          };

          // Exécuter en séquence
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});