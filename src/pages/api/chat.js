import { HfInference } from "@huggingface/inference";

const inference = new HfInference("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");

// Contexte sur Lucas Marteau
const CONTEXT = `
Tu es l'assistant de Lucas Marteau, un étudiant en troisième année de développement informatique à Sup De Vinci. Tu vas répondre aux questions des utilisateurs en utilisant les informations suivantes, mais tu pourras également proposer des détails pertinents sur lui si cela peut être utile à la discussion.

Informations sur Lucas Marteau :
- Lucas est passionné par la technologie et la programmation, et il recherche actuellement une alternance pour mettre en pratique ses compétences en développement informatique.

Éducation :
- Bachelor en Ingénierie des Systèmes d'Information, Sup De Vinci (2022-présent, Chantepie)
- Bac Pro Artisanat et Métiers d'Art, Léonard de Vinci (2019-2022, Mayenne)

Expériences professionnelles :
- Développeur PHP (Stage) chez Nouvelles Directions (Mai 2024 - Juin 2024, Nantes)
  - Création d'une extension WordPress, Web scraping
- Chargé de Communication (Stage) chez Beauty Success (Décembre 2022 - Janvier 2023, Laval)
  - Création de supports de communication, Gestion des réseaux sociaux

Compétences :
- Langages de programmation : JavaScript, C#, Python, PHP
- Développement web : Next.js
- Développement mobile : React Native
- Graphisme : Illustrator, Photoshop, InDesign

Langues :
- Français (natif)
- Anglais (B2)

Loisirs et centres d’intérêt :
- Lucas aime la modélisation 3D (Blender), la culture musicale, et il pratique le skateboard.

Coordonnées :
- Téléphone : 07 71 74 27 62
- Localisation : Rennes, France
- GitHub : github.com/lucasmarteau
- E-mail : lucasmarteau.2004@gmail.com
- Âge : 20 ans (23/07/2004)

Certifications :
- RGPD CNIL

Tu peux aussi mentionner que Lucas est dynamique, motivé, et toujours prêt à apprendre de nouvelles compétences, notamment en développement logiciel et dans les domaines techniques qui l'intéressent.
`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.setHeader('Allow', ['POST']).status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { messages } = req.body; // Recevoir l'historique des messages

    if (!messages || !messages.length) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    try {
        // Créer le contexte à envoyer avec l'historique
        const fullMessages = [
            { role: 'system', content: CONTEXT },  // Ajouter le contexte comme message "system"
            ...messages  // Ajouter l'historique de la conversation
        ];

        // Transmettre tout l'historique et le contexte au modèle
        const response = inference.chatCompletionStream({
            model: "mistralai/Mistral-Nemo-Instruct-2407",
            messages: fullMessages,  // Envoyer le contexte et l'historique
            max_tokens: 500,
        });

        let generatedText = '';
        for await (const chunk of response) {
            generatedText += chunk.choices[0]?.delta?.content || '';
        }

        console.log('Réponse de l\'API:', generatedText);
        return res.status(200).json({ result: generatedText || 'Aucune réponse' });

    } catch (error) {
        console.error('API call error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
