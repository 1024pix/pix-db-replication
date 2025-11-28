import { expect } from '../../../test-helper.js';

import * as modulixLcmsClient from '../../../../src/steps/modulix-learning-content/lcms-client.js';

describe('Unit | Steps | modulix-learning content | lcms-client.js', function() {
  describe('#getLearningContent', function() {
    it('should return static learning content', async function() {
      // when
      const modulixLearningContent = await modulixLcmsClient.getLearningContent();

      // then
      expect(modulixLearningContent).to.deep.equal([
        {
          id: '0aed9f0d-e735-48f8-900b-32cc4251dd0e',
          shortId: '8ee73f2b',
          slug: 'tmp-cyber-gestionnaire',
          title: 'Un coffre fort pour mes mots de passe',
        },
        {
          id: '93c4a755-7576-47b7-b2f0-9001ca9c2e57',
          shortId: '09afbfa2',
          slug: 'tmp-cyber-proteger-mdp',
          title: 'Protéger ses mots de passe',
        },
        {
          id: 'fbde0db0-344a-4b98-a9b4-68f74f358629',
          shortId: '0389ba82',
          slug: 'tmp-cyber-mdp-fort',
          title: 'Un mot de passe fort, c’est quoi ?',
        },
        {
          id: 'f924b0e8-0b2b-4b8e-b7fe-f1b14e9b8094',
          shortId: '4fb0e2cd',
          slug: 'tmp-cyber-ingenierie-sociale',
          title: 'Cyberattaques : quand l’ingénierie sociale s’en mêle !',
        },
        {
          id: '70813abe-7423-426d-80c8-b1f0271ae0b4',
          shortId: '82920553',
          slug: 'tmp-anatomie-message-arnaque',
          title: 'Anatomie d’un message d’arnaque',
        },
        {
          id: 'd86262d1-bf99-41d3-abc5-ef39c7d05288',
          shortId: '975d25d1',
          slug: 'cyber-message-arnaque',
          title: 'Vous avez un nouveau message ✉️ : attention aux arnaques',
        },
        {
          id: 'bc6d164f-26bd-4f58-9925-8cf5365e2ca6',
          shortId: '43e420e6',
          slug: 'tmp-ia-def-ind',
          title: 'Une IA apprentie botaniste : un cas d\'un apprentissage supervisé.',
        },
        {
          id: '40ab5711-4025-4052-a269-00fd0448d60a',
          shortId: 'cc0cbab7',
          slug: 'tmp-ia-dit-ia',
          title: 'IA, vous avez dit IA ? ',
        },
        {
          id: 'ccad60a8-6c48-4d91-84cb-d717a1ea4918',
          shortId: '5bb2f995',
          slug: 'tmp-iagenbiais-avance',
          title: 'IA génératives : Qui programme la morale ?',
        },
        {
          id: 'a1eea948-2125-488f-8006-9f85e646830d',
          shortId: '163b520e',
          slug: 'tmp-ia-bias-ind',
          title: 'Les biais des IA génératives',
        },
        {
          id: 'c8607621-09ab-4601-be7d-68ed9c914c30',
          shortId: '9be9cfae',
          slug: 'tmp-ia-hallu',
          title: 'Elles hallucinent, ces IA génératives ! ',
        },
        {
          id: '178e7bb5-9d0a-43e6-b0a1-c7039bd7e2a8',
          shortId: 'e5019e0e',
          slug: 'tmp-ia-biais-ind-alt',
          title: 'Les biais des lA',
        },
        {
          id: '8266f923-4255-46ba-97c5-61cbdbe18986',
          shortId: 'e71a9bdd',
          slug: 'tmp-iagenethique',
          title: 'Ce qu’il faut éviter de dire à une IA générative',
        },
        {
          id: 'd03cef94-74af-463d-8901-c886b48d6e0b',
          shortId: '76961c86',
          slug: 'tmp-ia-fonctionnement-ind',
          title: 'Comment l\'IA générative apprend-elle à discuter avec vous ?',
        },
        {
          id: '71618929-fcc9-415e-a3f3-9582545d7a78',
          shortId: '797ea8fb',
          slug: 'tmp-ia-fonctionnement-debut',
          title: 'Comment font les IA génératives pour répondre à nos demandes ?',
        },
        {
          id: '8343e9c1-5b46-4500-ab85-54061e0c4712',
          shortId: '6bf111e0',
          slug: 'les-ia-generatives-consomment',
          title: 'L‘IA générative, ça consomme !',
        },
        {
          id: '7a38c90d-9937-4497-bee3-fe58541af420',
          shortId: '4eacd0c3',
          slug: 'tmp-prompt-intermediaire',
          title: 'J’améliore mes prompts !',
        },
        {
          id: 'cf183961-e85a-421d-a316-05870191ff82',
          shortId: '4920d56c',
          slug: 'tmp-ia-premier-prompt',
          title: 'Mon premier prompt !',
        },
        {
          id: '8aa17e6d-3470-479d-838d-ff6923de6686',
          shortId: '05b24fee',
          slug: 'tmp-ia-deepfakes',
          title: 'Les deepfakes (hypertrucages) : c’est quoi ?',
        },
        {
          id: '5df14039-803b-4db4-9778-67e4b84afbbd',
          shortId: 'ecc13f55',
          slug: 'adresse-ip-publique-et-vous',
          title: 'L\'adresse IP publique : ce qu\'elle révèle sur vous !',
        },
        {
          id: '9beb922f-4d8e-495d-9c85-0e7265ca78d6',
          shortId: 'e074af34',
          slug: 'au-dela-des-mots-de-passe',
          title: 'Au-delà des mots de passe : comment s’authentifier ?',
        },
        {
          id: '6282925d-4775-4bca-b513-4c3009ec5886',
          shortId: '6a68bf32',
          slug: 'bac-a-sable',
          title: 'Bac à sable',
        },
        {
          id: '654c44dc-0560-4acc-9860-4a67c923577f',
          shortId: '740d5aa9',
          slug: 'bases-clavier-1',
          title: 'Les bases du clavier sur ordinateur 1/2',
        },
        {
          id: 'bb0a4ed3-1b49-4782-b867-05ade0868c4f',
          shortId: '31ca924a',
          slug: 'bases-clavier-2',
          title: 'Les bases du clavier sur ordinateur 2/2',
        },
        {
          id: 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d',
          shortId: '9d4dcab8',
          slug: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire une adresse mail',
        },
        {
          id: '01151659-77c1-41cc-8724-89091357af3d',
          shortId: 'e67ec5d0',
          slug: 'chatgpt-vraiment-neutre',
          title: 'ChatGPT est-il vraiment neutre ?',
        },
        {
          id: 'd4c4a2b2-0046-471d-ad9c-15f9cfc8f1f6',
          shortId: '7762efcb',
          slug: 'comment-envoyer-un-mail',
          title: 'Comment envoyer un mail ? ',
        },
        {
          id: 'a9e7dda1-fbcc-43a0-a9b4-90056548a4ae',
          shortId: '15894c06',
          slug: 'controle-parental',
          title: 'Le contrôle parental',
        },
        {
          id: '1c765240-c790-4f32-8ec0-bc9945bcc5ce',
          shortId: 'c6437577',
          slug: 'decouverte-de-l-ent',
          title: 'À la découverte de l’ENT',
        },
        {
          id: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
          shortId: '27d6ca4f',
          slug: 'demo-combinix-1',
          title: 'Demo combinix 1',
        },
        {
          id: 'f32a2238-4f65-4698-b486-15d51935d335',
          shortId: 'df82ec66',
          slug: 'demo-combinix-2',
          title: 'Demo combinix 2',
        },
        {
          id: '235c680e-cbd2-4c56-bef6-80d3ed4d417a',
          shortId: '0aefd71f',
          slug: 'demo-epreuves-components',
          title: 'Démonstration des composants Pix Épreuves',
        },
        {
          id: 'ab82925d-4775-4bca-b513-4c3009ec5886',
          shortId: 'f2eeb056',
          slug: 'demo-llm',
          title: 'Démo LLM',
        },
        {
          id: '65b761ab-3ebd-44a9-84b7-8b5e151aee76',
          shortId: '00832162',
          slug: 'distinguer-vrai-faux-sur-internet',
          title: 'Les informations sur internet : distinguer le vrai du faux',
        },
        {
          id: '1b33d6ab-ebfe-49fa-8568-8c40471b4baa',
          shortId: 'b9414fc3',
          slug: 'galerie',
          title: 'Galerie Modulix',
        },
        {
          id: 'bbc48a68-6bef-4261-89f0-86459413c10c',
          shortId: '0426c3c5',
          slug: 'ia-cadre-usage-educ-nov',
          title: 'IA et éducation, découverte du cadre d’usage',
        },
        {
          id: 'c7fe268a-9371-4eec-8a8a-df79c7479a46',
          shortId: 'a23e9d63',
          slug: 'tmp-ia-deepfakes-alt',
          title: 'Les deepfakes (hypertrucages) : c’est quoi ?',
        },
        {
          id: '875df1ff-27c1-4b41-a0a8-5ff46013f35e',
          shortId: '87edbdda',
          slug: 'jeux-video-enfant',
          title: 'Choisir un jeu vidéo adapté à son enfant',
        },
        {
          id: '8bdec793-7508-41b4-9df2-e1cf96969680',
          shortId: '3e5fa7fc',
          slug: 'mots-de-passe-securises',
          title: 'Des mots de passe solides',
        },
        {
          id: 'e2b42968-4797-46e7-b9ca-11d0d0dfa978',
          shortId: 'dc38a091',
          slug: 'metaux-eau-reemploi',
          title: 'Le numérique : pourquoi privilégier le réemploi ?',
        },
        {
          id: '12cd102f-9831-4264-8d5e-15a8f177594a',
          shortId: '4af95e9a',
          slug: 'ports-connexions-essentiels',
          title: 'Les ports de connexion d’un ordinateur',
        },
        {
          id: 'a64d1ca8-5222-464a-ae0c-e8bbdf949e18',
          shortId: '8c6d595b',
          slug: 'principes-fondateurs-wikipedia',
          title: 'Les principes fondateurs de Wikipédia',
        },
        {
          id: '68f92c57-9e66-4258-a2f4-b71fad7ab004',
          shortId: '9434a1a4',
          slug: 'sources-informations',
          title: 'Les sources d\'information',
        },
        {
          id: '08ef1a47-b691-4138-b899-39f3512fa152',
          shortId: 'f0506561',
          slug: 'tmp08ef',
          title: 'Derrière le prompt : comment fonctionnent les IA génératives ?',
        },
        {
          id: '19468565-a56b-4aa5-9bf0-369e94bc85ea',
          shortId: 'ed36b111',
          slug: 'tri-multicritere-tableau',
          title: 'Trier un tableau selon plusieurs critères',
        },
        {
          id: 'e8cee13e-1d4d-47eb-bd26-d7ea6a10b1e6',
          shortId: '3858d191',
          slug: 'utiliser-souris-ordinateur-1',
          title: 'Utiliser une souris d\'ordinateur - 1',
        },
        {
          id: '1f425bc6-7a35-4ceb-9634-a25da1e36233',
          shortId: 'f59200bf',
          slug: 'utiliser-souris-ordinateur-2',
          title: 'Utiliser une souris d\'ordinateur - 2',
        },
      ]);
    });
  });
});
