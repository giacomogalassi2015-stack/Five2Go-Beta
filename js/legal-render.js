console.log("✅ 3. ui-legal-render.js caricato (Localizzato & Fixato)");

// === RENDER PAGINA LEGALE ===
window.renderLegalPage = function() {
    const targetEl = document.getElementById('app-content');
    if (!targetEl) return;

    const curLang = window.currentLang || 'it';

    const privacyLinks = {
        it: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-it",
        en: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-en",
        es: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-es",
        fr: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-fr",
        de: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/privacy-policy-per-siti-web-o-e-commerce-de"
    };

    const cookieLinks = {
        it: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-it",
        en: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-en",
        es: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-es",
        fr: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-fr",
        de: "https://app.legalblink.it/api/documents/6973df3d9398e90022bdb487/cookie-policy-de"
    };

    const activePrivacy = privacyLinks[curLang] || privacyLinks['en'];
    const activeCookie  = cookieLinks[curLang]  || cookieLinks['en'];

    const contentText = {
        it: {
            title: "Note Legali", subtitle: "Termini di Utilizzo · Versione 2.0 · Gennaio 2026",
            intro: "Scaricando, installando o utilizzando l'applicazione <strong>«Five2Go»</strong> (di seguito «l'App»), l'utente dichiara di aver letto, compreso e accettato integralmente le seguenti condizioni. L'utilizzo dell'App costituisce accettazione espressa ai sensi degli artt. 1326 e 1327 c.c.",
            s1_label: "Informazioni Generali",
            p1_title: "1. Natura Non Ufficiale e Indipendente",
            p1_body: "<strong>Nessuna Affiliazione:</strong> «Five2Go» è un progetto editoriale privato e indipendente. L'App NON rappresenta, né è affiliata, finanziata, sponsorizzata o autorizzata dall'Ente Parco Nazionale delle Cinque Terre, dalle amministrazioni comunali, da Trenitalia S.p.A., dal Consorzio Marittimo Turistico o da qualsiasi altro ente istituzionale, pubblico o privato.<br><br><strong>Validità Informativa:</strong> Tutte le informazioni (mappe, orari, descrizioni, tracce GPX) sono fornite a esclusivo scopo turistico e indicativo. Non hanno valore legale, cartografico, normativo o di soccorso. Per avvisi ufficiali (es. allerte meteo, chiusura sentieri, ordinanze), l'utente è tenuto a consultare esclusivamente i canali ufficiali degli enti preposti.",
            s2_label: "Sicurezza e Responsabilità",
            p2_title: "2. Escursionismo e Sicurezza (Clausola Onerosa ex Art. 1341 c.c.)",
            p2_body: "L'attività escursionistica nelle Cinque Terre presenta rischi oggettivi connessi alla morfologia impervia del territorio. <strong>L'utente, con l'utilizzo dell'App, accetta espressamente e specificamente le seguenti clausole onerose:</strong><br><br><strong>a) Assunzione del Rischio:</strong> L'utente utilizza le tracce GPX e le indicazioni dell'App a proprio esclusivo rischio e pericolo. L'Autore declina ogni responsabilità per danni fisici, materiali, smarrimenti, interventi di soccorso o decessi derivanti dall'uso delle informazioni contenute nell'App.<br><br><strong>b) Priorità della Segnaletica Ufficiale:</strong> La segnaletica in loco e le ordinanze degli enti competenti prevalgono SEMPRE sulle indicazioni digitali. In caso di discordanza, fare esclusivo affidamento sulle indicazioni ufficiali.<br><br><strong>c) Proprietà Privata:</strong> Le tracce potrebbero attraversare fondi privati. L'utente è personalmente responsabile del rispetto della proprietà altrui e del divieto di accesso.<br><br><strong>d) Valutazione Autonoma:</strong> Spetta esclusivamente all'escursionista valutare se il percorso, la difficoltà e le condizioni del giorno sono adatti al proprio livello fisico, alla propria esperienza e all'equipaggiamento disponibile.",
            p3_title: "3. Dati Tecnici e Limiti GPS",
            p3_body: "<strong>Precisione:</strong> A causa della conformazione rocciosa delle Cinque Terre, il segnale GPS può risultare impreciso, distorto o assente. L'Autore non garantisce l'accuratezza delle coordinate. L'App non costituisce strumento di soccorso o navigazione di emergenza.<br><br><strong>Continuità del Servizio:</strong> L'Autore si riserva il diritto di modificare, sospendere o interrompere l'App in qualsiasi momento, senza preavviso e senza obbligo di indennizzo.",
            s3_label: "Servizi e Terze Parti",
            p4_title: "4. Trasporti, Orari e Servizi Terzi",
            p4_body: "Gli orari di trasporto sono aggregati da fonti pubbliche e soggetti a variazioni senza preavviso. L'App può contenere link a piattaforme terze (es. acquisto biglietti). L'Autore <strong>non è un intermediario di vendita</strong>, non gestisce pagamenti, non è responsabile per errori, mancati rimborsi o disservizi su piattaforme esterne.",
            s4_label: "Proprietà Intellettuale",
            p5_title: "5. Proprietà Intellettuale e Copyright",
            p5_body: "Il codice sorgente, il design, il marchio e logo «Five2Go», i testi originali e le selezioni di dati costituiscono opere dell'ingegno protette ai sensi della L. 633/1941 (Legge sul Diritto d'Autore) e del Reg. (UE) 2019/1150.<br><br><strong>È espressamente vietato, senza preventivo consenso scritto dell'Autore:</strong><br>• Copiare, riprodurre, distribuire o rivendere il codice sorgente;<br>• Effettuare scraping, crawling o raccolta automatizzata di dati;<br>• Creare opere derivate, fork pubblici o applicazioni concorrenti;<br>• Utilizzare il marchio «Five2Go» o il logo in contesti non autorizzati.<br><br>La violazione espone il trasgressore a responsabilità civile e penale (artt. 171 ss. L. 633/1941). Per richieste di licenza: <a href='mailto:five2go.info@gmail.com' class='text-ct-terracotta underline font-bold'>five2go.info@gmail.com</a>",
            s5_label: "Disposizioni Finali",
            p6_title: "6. Privacy e Trattamento dei Dati",
            p6_body: "Il trattamento dei dati personali è disciplinato dall'informativa Privacy Policy, redatta ai sensi del GDPR (Reg. UE 2016/679), accessibile tramite il link in questa sezione. L'Autore non raccoglie dati sensibili e non cede dati a terzi a fini commerciali.",
            p7_title: "7. Indennizzo (Manleva)",
            p7_body: "L'utente accetta di manlevare e tenere indenne l'Autore da qualsiasi pretesa, danno, perdita, responsabilità, costo o spesa (incluse ragionevoli spese legali) derivanti da: (a) violazione dei presenti Termini; (b) uso improprio dell'App; (c) violazione di diritti di terzi.",
            p8_title: "8. Clausola di Salvaguardia",
            p8_body: "Qualora una o più disposizioni dei presenti Termini risultassero nulle o inefficaci ai sensi della legge applicabile, le restanti disposizioni rimarranno in vigore nella misura massima consentita dalla legge.",
            p9_title: "9. Legge Applicabile e Foro Competente",
            p9_body: "I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia sarà competente in via esclusiva il Foro di residenza dell'Autore, fatti salvi i fori inderogabili a tutela del consumatore. In caso di discordanza tra versioni linguistiche, fa fede la versione in lingua <strong>italiana</strong>.",
            lbl_doc: "Documenti", lbl_privacy: "Privacy Policy", lbl_cookie: "Cookie Policy",
            lbl_consent: "Gestisci Consenso Cookie", lbl_contact: "Contatti",
            footer_rights: "Tutti i diritti riservati.", last_update: "Versione 2.0 · Ultimo aggiornamento: Gennaio 2026"
        },
        en: {
            title: "Legal Notice", subtitle: "Terms of Use · Version 2.0 · January 2026",
            intro: "By downloading, installing or using <strong>«Five2Go»</strong> (hereinafter «the App»), the user declares to have read, understood and fully accepted the following conditions. Use of the App constitutes express acceptance under applicable contract law.",
            s1_label: "General Information",
            p1_title: "1. Non-Official and Independent Nature",
            p1_body: "<strong>No Affiliation:</strong> «Five2Go» is a private, independent editorial project. The App does NOT represent, nor is it affiliated with, funded by, sponsored by or authorised by the Cinque Terre National Park Authority, local municipalities, Trenitalia S.p.A., the Maritime Tourist Consortium or any other official body.<br><br><strong>Information Only:</strong> All information (maps, schedules, descriptions, GPX tracks) is provided for tourist and indicative purposes only. It has no legal, regulatory or rescue validity. For official notices, users must consult the official channels of the relevant authorities.",
            s2_label: "Safety & Liability",
            p2_title: "2. Hiking and Safety (Limitation of Liability Clause)",
            p2_body: "Hiking in Cinque Terre involves objective risks. <strong>By using the App, the user expressly accepts the following clauses:</strong><br><br><strong>a) Assumption of Risk:</strong> The user uses GPX tracks and App information entirely at their own risk. The Author declines all liability for physical injury, property damage, getting lost, rescue operations or death resulting from use of the App's information.<br><br><strong>b) Priority of Official Signage:</strong> On-site signage and competent authority orders ALWAYS override digital indications. Where discrepancies exist, rely exclusively on official guidance.<br><br><strong>c) Private Property:</strong> Tracks may cross private land. The user is personally responsible for respecting private property and access restrictions.<br><br><strong>d) Self-Assessment:</strong> It is the hiker's sole responsibility to assess whether the route, difficulty and conditions are suitable for their fitness, experience and equipment.",
            p3_title: "3. Technical Data and GPS Limitations",
            p3_body: "<strong>Accuracy:</strong> Due to the rocky terrain, GPS signal may be inaccurate, distorted or absent. The Author does not guarantee coordinate accuracy. The App is not a rescue or emergency navigation tool.<br><br><strong>Service Continuity:</strong> The Author reserves the right to modify, suspend or discontinue the App at any time without notice or obligation to compensate users.",
            s3_label: "Services & Third Parties",
            p4_title: "4. Transport, Schedules and Third-Party Services",
            p4_body: "Transport schedules are aggregated from public sources and subject to change without notice. The App may contain links to third-party platforms (e.g. ticket purchases). The Author <strong>is not a sales intermediary</strong>, does not process payments, and is not liable for errors, refund failures or service disruptions on external platforms.",
            s4_label: "Intellectual Property",
            p5_title: "5. Intellectual Property and Copyright",
            p5_body: "The source code, design, the «Five2Go» trademark and logo, original texts and data selections are protected under Italian Law No. 633/1941 (Copyright Act) and EU Regulation 2019/1150.<br><br><strong>Without prior written consent of the Author, it is strictly prohibited to:</strong><br>• Copy, reproduce, distribute or resell the source code;<br>• Perform scraping, crawling or automated data collection;<br>• Create derivative works, public forks or competing applications;<br>• Use the «Five2Go» trademark or logo in unauthorised contexts.<br><br>Violations expose the infringer to civil and criminal liability. Licensing enquiries: <a href='mailto:five2go.info@gmail.com' class='text-ct-terracotta underline font-bold'>five2go.info@gmail.com</a>",
            s5_label: "Final Provisions",
            p6_title: "6. Privacy and Data Processing",
            p6_body: "The processing of users' personal data is governed by the Privacy Policy drafted in accordance with GDPR (EU Regulation 2016/679), accessible via the Privacy Policy link in this section. The Author does not collect sensitive personal data and does not sell data to third parties for commercial purposes.",
            p7_title: "7. Indemnification",
            p7_body: "The user agrees to indemnify and hold harmless the Author from any claim, damage, loss, liability, cost or expense (including reasonable legal fees) arising from: (a) breach of these Terms; (b) improper use of the App; (c) infringement of third-party rights.",
            p8_title: "8. Severability",
            p8_body: "If any provision of these Terms is found to be void or ineffective under applicable law, the remaining provisions shall remain in full force and effect to the maximum extent permitted by law.",
            p9_title: "9. Applicable Law and Jurisdiction",
            p9_body: "These Terms are governed by Italian law. Any dispute shall be subject to the exclusive jurisdiction of the court of the Author's place of residence, except where mandatory consumer protection laws provide otherwise. In case of discrepancy between language versions, the <strong>Italian version</strong> shall prevail.",
            lbl_doc: "Documents", lbl_privacy: "Privacy Policy", lbl_cookie: "Cookie Policy",
            lbl_consent: "Manage Cookie Consent", lbl_contact: "Contact",
            footer_rights: "All rights reserved.", last_update: "Version 2.0 · Last updated: January 2026"
        },
        es: {
            title: "Aviso Legal", subtitle: "Términos de Uso · Versión 2.0 · Enero 2026",
            intro: "Al descargar, instalar o utilizar <strong>«Five2Go»</strong>, el usuario declara haber leído, comprendido y aceptado íntegramente las siguientes condiciones.",
            s1_label: "Información General",
            p1_title: "1. Naturaleza No Oficial e Independiente",
            p1_body: "<strong>Sin Afiliación:</strong> «Five2Go» es un proyecto privado e independiente. NO está afiliado al Parque Nacional Cinque Terre, municipios locales, Trenitalia S.p.A. ni a ningún organismo oficial.<br><br><strong>Solo Informativo:</strong> Toda la información es de carácter turístico e indicativo. Para alertas oficiales, consulte los canales oficiales.",
            s2_label: "Seguridad y Responsabilidad",
            p2_title: "2. Senderismo y Seguridad (Limitación de Responsabilidad)",
            p2_body: "<strong>a) Asunción del Riesgo:</strong> El uso es bajo riesgo propio. El Autor declina toda responsabilidad por lesiones, daños o fallecimientos.<br><br><strong>b) Prioridad de la Señalización:</strong> La señalización in situ SIEMPRE prevalece sobre los datos digitales.<br><br><strong>c) Propiedad Privada:</strong> El usuario es responsable de respetar la propiedad privada.<br><br><strong>d) Autoevaluación:</strong> El usuario debe evaluar su capacidad y equipamiento.",
            p3_title: "3. Límites Técnicos y GPS",
            p3_body: "La señal GPS puede ser inexacta. La App no es un instrumento de rescate. El Autor se reserva el derecho a modificar o interrumpir el servicio sin previo aviso.",
            s3_label: "Servicios y Terceros",
            p4_title: "4. Transporte, Horarios y Servicios de Terceros",
            p4_body: "Los horarios son agregados de fuentes públicas y sujetos a cambios. El Autor <strong>no es intermediario de ventas</strong> y no es responsable de errores en plataformas externas.",
            s4_label: "Propiedad Intelectual",
            p5_title: "5. Propiedad Intelectual y Copyright",
            p5_body: "El código, diseño, marca y textos de «Five2Go» están protegidos por la ley italiana e internacional.<br><br><strong>Sin autorización escrita previa, está prohibido:</strong><br>• Copiar o redistribuir el código;<br>• Realizar scraping de datos;<br>• Crear aplicaciones derivadas o competidoras;<br>• Usar la marca sin autorización.<br><br>Consultas: <a href='mailto:five2go.info@gmail.com' class='text-ct-terracotta underline font-bold'>five2go.info@gmail.com</a>",
            s5_label: "Disposiciones Finales",
            p6_title: "6. Privacidad y Datos", p6_body: "El tratamiento de datos se rige por la Política de Privacidad conforme al RGPD (Reglamento UE 2016/679).",
            p7_title: "7. Indemnización", p7_body: "El usuario acepta indemnizar al Autor frente a reclamaciones derivadas del uso indebido o violación de estos Términos.",
            p8_title: "8. Cláusula de Salvaguarda", p8_body: "Si alguna disposición es nula, las restantes permanecen en vigor.",
            p9_title: "9. Ley y Jurisdicción", p9_body: "Rigen la ley italiana y los tribunales de residencia del Autor. En caso de discrepancia, prevalece la <strong>versión italiana</strong>.",
            lbl_doc: "Documentación", lbl_privacy: "Política de Privacidad", lbl_cookie: "Política de Cookies",
            lbl_consent: "Gestionar Consentimiento", lbl_contact: "Contacto",
            footer_rights: "Todos los derechos reservados.", last_update: "Versión 2.0 · Última actualización: Enero 2026"
        },
        fr: {
            title: "Mentions Légales", subtitle: "Conditions d'Utilisation · Version 2.0 · Janvier 2026",
            intro: "En téléchargeant, installant ou utilisant <strong>«Five2Go»</strong>, l'utilisateur déclare avoir lu, compris et accepté les conditions suivantes.",
            s1_label: "Informations Générales",
            p1_title: "1. Nature Non Officielle et Indépendante",
            p1_body: "<strong>Pas d'Affiliation :</strong> «Five2Go» est un projet privé. Il n'est PAS affilié au Parc National ou aux entités officielles.<br><br><strong>Caractère Informatif :</strong> Toutes les informations sont indicatives. Pour les alertes officielles, consultez les canaux officiels.",
            s2_label: "Sécurité et Responsabilité",
            p2_title: "2. Randonnée et Sécurité (Clause de Limitation de Responsabilité)",
            p2_body: "<strong>a) Acceptation des Risques :</strong> L'utilisation est à l'entière responsabilité de l'utilisateur. L'Auteur décline toute responsabilité pour blessures ou décès.<br><br><strong>b) Priorité de la Signalisation :</strong> La signalisation sur place prévaut TOUJOURS.<br><br><strong>c) Propriété Privée :</strong> Respectez les propriétés privées.<br><br><strong>d) Auto-évaluation :</strong> L'utilisateur doit évaluer ses capacités.",
            p3_title: "3. Limites Techniques et GPS",
            p3_body: "Le signal GPS peut être imprécis. L'Application n'est pas un instrument de secours. L'Auteur se réserve le droit de modifier ou d'interrompre le service.",
            s3_label: "Services et Tiers",
            p4_title: "4. Transports, Horaires et Services Tiers",
            p4_body: "Les horaires peuvent changer. L'Auteur <strong>n'est pas un intermédiaire de vente</strong> et décline toute responsabilité pour les erreurs sur plateformes externes.",
            s4_label: "Propriété Intellectuelle",
            p5_title: "5. Propriété Intellectuelle et Droits d'Auteur",
            p5_body: "Le code, le design et la marque «Five2Go» sont protégés par le droit d'auteur.<br><br><strong>Sans autorisation écrite, il est interdit de :</strong><br>• Copier ou redistribuer le code ;<br>• Effectuer du scraping de données ;<br>• Créer des applications dérivées ;<br>• Utiliser la marque sans autorisation.<br><br>Contact : <a href='mailto:five2go.info@gmail.com' class='text-ct-terracotta underline font-bold'>five2go.info@gmail.com</a>",
            s5_label: "Dispositions Finales",
            p6_title: "6. Vie Privée et Données", p6_body: "Le traitement des données est régi par la Politique de Confidentialité conformément au RGPD (Règlement UE 2016/679).",
            p7_title: "7. Indemnisation", p7_body: "L'utilisateur accepte d'indemniser l'Auteur contre toute réclamation découlant d'une utilisation abusive.",
            p8_title: "8. Clause de Sauvegarde", p8_body: "Si une disposition est nulle, les autres restent en vigueur.",
            p9_title: "9. Droit Applicable et Juridiction", p9_body: "Le droit italien est applicable. En cas de divergence, la <strong>version italienne</strong> fait foi.",
            lbl_doc: "Documentation", lbl_privacy: "Politique de Confidentialité", lbl_cookie: "Politique Cookies",
            lbl_consent: "Gérer le Consentement", lbl_contact: "Contact",
            footer_rights: "Tous droits réservés.", last_update: "Version 2.0 · Dernière mise à jour : Janvier 2026"
        },
        de: {
            title: "Rechtliche Hinweise", subtitle: "Nutzungsbedingungen · Version 2.0 · Januar 2026",
            intro: "Durch das Herunterladen, Installieren oder Verwenden von <strong>«Five2Go»</strong> erklärt der Nutzer, die folgenden Bedingungen gelesen und akzeptiert zu haben.",
            s1_label: "Allgemeine Informationen",
            p1_title: "1. Inoffizieller und Unabhängiger Charakter",
            p1_body: "<strong>Keine Zugehörigkeit:</strong> «Five2Go» ist ein privates, unabhängiges Projekt. Es ist NICHT mit dem Nationalpark Cinque Terre, Gemeindeverwaltungen, Trenitalia oder anderen offiziellen Stellen verbunden.<br><br><strong>Nur Informativ:</strong> Alle Informationen sind rein touristisch. Für offizielle Meldungen konsultieren Sie die zuständigen Behörden.",
            s2_label: "Sicherheit und Haftung",
            p2_title: "2. Wandern und Sicherheit (Haftungsbeschränkungsklausel)",
            p2_body: "<strong>a) Risikoübernahme:</strong> Die Nutzung erfolgt auf eigene Gefahr. Der Autor haftet nicht für Verletzungen, Schäden oder Todesfälle.<br><br><strong>b) Vorrang der Beschilderung:</strong> Beschilderung vor Ort hat IMMER Vorrang.<br><br><strong>c) Privateigentum:</strong> Respektieren Sie Privateigentum.<br><br><strong>d) Selbsteinschätzung:</strong> Der Nutzer muss seine Fitness beurteilen.",
            p3_title: "3. Technische Grenzen und GPS",
            p3_body: "Das GPS-Signal kann ungenau sein. Die App ist kein Notfallinstrument. Der Autor behält sich das Recht vor, den Dienst ohne Vorankündigung zu ändern.",
            s3_label: "Dienste und Dritte",
            p4_title: "4. Verkehr, Fahrpläne und Drittanbieterdienste",
            p4_body: "Fahrpläne können sich ändern. Der Autor <strong>ist kein Vermittler</strong> und haftet nicht für externe Plattformen.",
            s4_label: "Geistiges Eigentum",
            p5_title: "5. Geistiges Eigentum und Urheberrecht",
            p5_body: "Code, Design und die Marke «Five2Go» sind urheberrechtlich geschützt.<br><br><strong>Ohne schriftliche Genehmigung ist verboten:</strong><br>• Kopieren oder Verteilen des Codes;<br>• Web Scraping;<br>• Erstellen konkurrierender Anwendungen;<br>• Nicht autorisierte Markennutzung.<br><br>Lizenzanfragen: <a href='mailto:five2go.info@gmail.com' class='text-ct-terracotta underline font-bold'>five2go.info@gmail.com</a>",
            s5_label: "Schlussbestimmungen",
            p6_title: "6. Datenschutz", p6_body: "Die Datenverarbeitung richtet sich nach der Datenschutzerklärung gemäß DSGVO (EU-Verordnung 2016/679).",
            p7_title: "7. Schadloshaltung", p7_body: "Der Nutzer erklärt sich damit einverstanden, den Autor von Ansprüchen freizustellen, die aus missbräuchlicher Nutzung entstehen.",
            p8_title: "8. Salvatorische Klausel", p8_body: "Sollte eine Bestimmung unwirksam sein, bleiben die übrigen in Kraft.",
            p9_title: "9. Anwendbares Recht und Gerichtsstand", p9_body: "Es gilt italienisches Recht. Bei Abweichungen gilt die <strong>italienische Version</strong>.",
            lbl_doc: "Dokumente", lbl_privacy: "Datenschutzerklärung", lbl_cookie: "Cookie-Richtlinie",
            lbl_consent: "Einwilligung verwalten", lbl_contact: "Kontakt",
            footer_rights: "Alle Rechte vorbehalten.", last_update: "Version 2.0 · Letzte Aktualisierung: Januar 2026"
        },
        zh: {
            title: "法律声明", subtitle: "使用条款 · 第2.0版 · 2026年1月",
            intro: "下载、安装或使用<strong>«Five2Go»</strong>，即表示用户已完全阅读、理解并接受以下条款。",
            s1_label: "基本信息",
            p1_title: "1. 非官方及独立性质",
            p1_body: "<strong>无隶属关系：</strong>«Five2Go»与五渔村国家公园、当地市政府、意大利国铁或任何官方机构无任何关联。<br><br><strong>仅供参考：</strong>所有信息（地图、时刻表、GPX轨迹）仅供旅游参考，不具法律效力。",
            s2_label: "安全与责任",
            p2_title: "2. 徒步旅行与安全（责任限制条款）",
            p2_body: "<strong>a) 风险承担：</strong>用户使用GPX轨迹须自担风险。作者对人身伤害、财产损失或死亡不承担责任。<br><br><strong>b) 官方指示优先：</strong>现场标识始终优先于数字指示。<br><br><strong>c) 私有财产：</strong>用户须尊重他人私有财产。<br><br><strong>d) 自我评估：</strong>用户须自行评估体能及装备。",
            p3_title: "3. 技术限制与GPS",
            p3_body: "GPS信号可能不准确。本应用不是急救工具。作者保留随时修改或停止服务的权利。",
            s3_label: "服务与第三方",
            p4_title: "4. 交通、时刻表及第三方服务",
            p4_body: "时刻表来自公开来源，可能更改。作者<strong>不是售票中间商</strong>，对外部平台错误不承担责任。",
            s4_label: "知识产权",
            p5_title: "5. 知识产权与版权",
            p5_body: "源代码、设计及«Five2Go»商标受意大利著作权法及国际条约保护。<br><br><strong>未经书面授权，严禁：</strong><br>• 复制或分发代码；<br>• 进行数据爬取；<br>• 创建衍生应用；<br>• 擅自使用商标。<br><br>许可咨询：<a href='mailto:five2go.info@gmail.com' class='text-ct-terracotta underline font-bold'>five2go.info@gmail.com</a>",
            s5_label: "最终条款",
            p6_title: "6. 隐私与数据处理", p6_body: "用户数据处理受依据GDPR（欧盟条例2016/679）的隐私政策约束。",
            p7_title: "7. 赔偿", p7_body: "用户同意就滥用本应用或违反条款而产生的索赔向作者进行赔偿。",
            p8_title: "8. 可分割性条款", p8_body: "若任何条文无效，其余条文仍完全有效。",
            p9_title: "9. 适用法律与管辖", p9_body: "受意大利法律管辖。各语言版本存在差异时，以<strong>意大利语版本</strong>为准。",
            lbl_doc: "法律文件", lbl_privacy: "隐私政策", lbl_cookie: "Cookie政策",
            lbl_consent: "管理Cookie许可", lbl_contact: "联系方式",
            footer_rights: "版权所有。", last_update: "第2.0版 · 最后更新：2026年1月"
        }
    };

    const t = contentText[curLang] || contentText['en'];

    // ── Helpers ──────────────────────────────────────────────────────
    const pill = (label) =>
        `<div class="flex items-center gap-2 my-1">
            <div class="h-px flex-1 bg-slate-100"></div>
            <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 px-2">${label}</span>
            <div class="h-px flex-1 bg-slate-100"></div>
        </div>`;

    const card = (title, body, border = 'border-slate-100') =>
        `<div class="bg-white rounded-2xl border ${border} shadow-sm px-4 pt-4 pb-4 mb-3">
            <h4 class="font-serif font-bold text-slate-800 text-sm leading-snug mb-2">${title}</h4>
            <div class="text-slate-500 text-[13px] leading-relaxed">${body}</div>
        </div>`;

    const docLink = (icon, label, href, rightIcon = 'chevron_right') =>
        `<a href="${href}" target="_blank" rel="noopener"
            class="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all touch-manipulation" style="text-decoration:none;color:inherit;">
            <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <span class="material-icons text-slate-500 text-lg">${icon}</span>
            </div>
            <span class="flex-1 text-sm font-bold text-slate-700">${label}</span>
            <span class="material-icons text-slate-300 text-xl">${rightIcon}</span>
        </a>`;
    // ─────────────────────────────────────────────────────────────────

    targetEl.innerHTML = `
    <div class="flex items-center gap-4 mb-5 animate-fade pt-2">
        <button onclick="renderServicesGrid()"
            class="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-[0_4px_0_rgb(203,213,225)] border-2 border-slate-200 active:scale-95 active:shadow-none active:translate-y-1 transition-all touch-manipulation shrink-0">
            <span class="material-icons text-slate-700">arrow_back</span>
        </button>
        <div class="min-w-0">
            <h2 class="text-2xl font-serif font-bold text-slate-800 leading-none truncate">${t.title}</h2>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">${t.subtitle}</p>
        </div>
    </div>

    <div class="flex flex-col pb-32 animate-pop">

        <!-- Intro -->
        <div class="bg-ct-sand rounded-2xl px-4 py-4 border border-amber-100/80 flex gap-3 mb-4">
            <span class="material-icons text-ct-terracotta text-lg shrink-0 mt-0.5">info</span>
            <p class="text-[13px] text-slate-600 leading-relaxed">${t.intro}</p>
        </div>

        ${pill(t.s1_label)}
        ${card(t.p1_title, t.p1_body)}

        ${pill(t.s2_label)}
        ${card(t.p2_title, t.p2_body, 'border-red-100')}
        ${card(t.p3_title, t.p3_body)}

        ${pill(t.s3_label)}
        ${card(t.p4_title, t.p4_body)}

        ${pill(t.s4_label)}
        ${card(t.p5_title, t.p5_body)}

        ${pill(t.s5_label)}
        ${card(t.p6_title, t.p6_body)}
        ${card(t.p7_title, t.p7_body)}
        ${card(t.p8_title, t.p8_body)}
        ${card(t.p9_title, t.p9_body)}

        ${pill(t.lbl_doc)}
        <div class="flex flex-col gap-2 mb-3">
            ${docLink('lock', t.lbl_privacy + ' (' + curLang.toUpperCase() + ')', activePrivacy)}
            ${docLink('cookie', t.lbl_cookie + ' (' + curLang.toUpperCase() + ')', activeCookie)}
            <a href="javascript:void(0)"
               onclick="document.getElementById('ghost-cookie-btn').click()"
               class="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all touch-manipulation cursor-pointer" style="text-decoration:none;color:inherit;">
                <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <span class="material-icons text-slate-500 text-lg">tune</span>
                </div>
                <span class="flex-1 text-sm font-bold text-slate-700">${t.lbl_consent}</span>
                <span class="material-icons text-slate-300 text-xl">settings</span>
            </a>
        </div>

        ${pill(t.lbl_contact)}
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <span class="material-icons text-white text-lg">alternate_email</span>
            </div>
            <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Five2Go</div>
                <a href="mailto:five2go.info@gmail.com" class="text-sm font-bold text-ct-terracotta">five2go.info@gmail.com</a>
            </div>
        </div>

        <div class="text-center pt-1 pb-2">
            <p class="font-serif font-bold text-slate-400 text-sm">Five2Go</p>
            <p class="text-[10px] text-slate-400 mt-0.5">© 2026 Five2Go. ${t.footer_rights}</p>
            <p class="text-[10px] text-slate-300 mt-1">${t.last_update}</p>
        </div>

    </div>`;
};