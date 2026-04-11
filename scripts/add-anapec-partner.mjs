#!/usr/bin/env node
/**
 * Script pour ajouter ANAPEC comme partenaire dans Supabase
 * Usage: node scripts/add-anapec-partner.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement manquantes!');
  console.error('   Assurez-vous que .env.local contient:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addAnapecPartner() {
  console.log('\n🤝 === AJOUT DU PARTENAIRE ANAPEC ===\n');

  try {
    // 1. Charger les données ANAPEC
    console.log('📋 Chargement des données ANAPEC...');
    const dataPath = path.join(__dirname, '../data/partners/anapec-partner.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Fichier de données non trouvé:', dataPath);
      process.exit(1);
    }

    const anapecData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log('✅ Données chargées');

    // 2. Vérifier si ANAPEC existe déjà
    console.log('\n🔍 Vérification si ANAPEC existe déjà...');
    const { data: existingPartner, error: checkError } = await supabase
      .from('partners')
      .select('id, company_name')
      .eq('company_name', anapecData.companyName)
      .maybeSingle();

    if (checkError) {
      console.warn('⚠️  Erreur vérification:', checkError.message);
    }

    if (existingPartner) {
      console.log('⚠️  ANAPEC existe déjà:', existingPartner.id);
      console.log('\nVoulez-vous le mettre à jour ? (oui/non)');
      // Pour ce script, on va directement updater
    }

    // 3. Créer/Updater le partenaire
    console.log('\n💾 Insertion/Mise à jour de ANAPEC...');
    
    const partnerData = {
      company_name: anapecData.companyName,
      partner_type: anapecData._metadata?.partner_type || 'government',
      sector: anapecData._metadata?.sector || 'Employment & Skills',
      description: anapecData.description,
      tagline: anapecData.tagline,
      logo_url: anapecData.logo,
      website: anapecData.contactInfo.website,
      contact_email: anapecData.contactInfo.email,
      contact_phone: anapecData.contactInfo.phone,
      contact_address: anapecData.contactInfo.address,
      verified: true,
      featured: true,
      metadata: {
        ...anapecData,
        extractedAt: new Date().toISOString()
      }
    };

    if (existingPartner) {
      // Update existant
      const { data, error } = await supabase
        .from('partners')
        .update(partnerData)
        .eq('id', existingPartner.id)
        .select();

      if (error) {
        console.error('❌ Erreur update:', error.message);
        return;
      }

      console.log('✅ ANAPEC mise à jour');
      console.log('📊 ID:', data[0]?.id);
    } else {
      // Création nouvelle
      const { data, error } = await supabase
        .from('partners')
        .insert(partnerData)
        .select();

      if (error) {
        console.error('❌ Erreur insertion:', error.message);
        return;
      }

      console.log('✅ ANAPEC créé');
      console.log('📊 ID:', data[0]?.id);
    }

    // 4. Afficher les informations
    console.log('\n📋 === INFORMATIONS ANAPEC ===');
    console.log(`Nom: ${anapecData.companyName}`);
    console.log(`Type: ${anapecData._metadata?.partner_type || 'Partenaire'}`);
    console.log(`Secteur: ${anapecData._metadata?.sector}`);
    console.log(`Email: ${anapecData.contactInfo.email}`);
    console.log(`Téléphone: ${anapecData.contactInfo.phone}`);
    console.log(`Adresse: ${anapecData.contactInfo.address}`);
    console.log(`Site: ${anapecData.contactInfo.website}`);
    
    console.log('\n📊 === CONTENU ===');
    console.log(`Services: ${anapecData.services?.length || 0}`);
    console.log(`Produits/Programmes: ${anapecData.products?.length || 0}`);
    console.log(`Équipe: ${anapecData.teamMembers?.length || 0}`);
    console.log(`Articles: ${anapecData.articles?.length || 0}`);
    console.log(`Réseaux sociaux: ${Object.values(anapecData.socialLinks || {}).filter(x => x).length}`);
    
    console.log('\n✅ === PARTENAIRE ANAPEC AJOUTÉ AVEC SUCCÈS ===\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter
addAnapecPartner().catch(console.error);
