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

// Nouvelle route pour les postes de contrôle
app.get('/api/postes-controle', (req, res) => {
  pool.query(
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
      e.VILLE_EXPORTATEUR
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
          DATE_EXPIR_DEMANDE = ?
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
      NATURE_DEMANDE, CODE_NATURE_PRESTATION, DATE_EXPIR_DEMANDE, VALIDER_DEMANDE, ETAT_DEMANDE
    ) VALUES (?, ?, 'TYPE-A', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'En attente')
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});