function mockLcmsAirtableData() {
  return {
    'areas': [
      {
        'code': '1',
        'color': 'jaffa',
        'competenceAirtableIds': [
          'recH9MjIzN54zXlwr',
          'recxlJqKdbWHHFZMQ',
          'recKxnZJh5dyRCQQn',
          'recZ1Gm4rud4zLhbF',
        ],
        'competenceIds': [
          'recH9MjIzN54zXlwr',
          'recxlJqKdbWHHFZMQ',
          'recKxnZJh5dyRCQQn',
          'recZ1Gm4rud4zLhbF',
        ],
        'id': 'recxjkrnVBVSI8RkS',
        'name': '1. Savoirs essentiels',
        'titleEnUs': ' Essential knowledge',
        'titleFrFr': 'Savoirs essentiels',
      },
      {
        'code': '2',
        'color': 'emerald',
        'competenceAirtableIds': [
          'recxf7xB2qNV8g5ZT',
          'recoVElv3xmVppK5a',
        ],
        'competenceIds': [
          'recxf7xB2qNV8g5ZT',
          'recoVElv3xmVppK5a',
        ],
        'id': 'recZwplcNbXVlDVlx',
        'name': '2. Savoirs moins essentiels',
        'titleEnUs': 'Less essential knowledge',
        'titleFrFr': 'Savoirs moins essentiels',
      },
    ],
    'attachments': [
      {
        'challengeId': 'recPbD9nJKGqmopDI',
        'id': 'rec51YEsOWyEAWSW3',
        'mimeType': 'image/tiff',
        'size': 60237024,
        'type': 'attachment',
        'url': 'https://dl.pix.fr/recjJ4JfIWmuvhk611623752106808/_A0A3502.tif',
      },
    ],
    'challenges': [
      {
        'airtableId': 'rec0hSrPM5bHqMP8T',
        'alpha': null,
        'alternativeInstruction': '',
        'autoReply': true,
        'competenceId': 'recKxnZJh5dyRCQQn',
        'delta': null,
        'embedHeight': 500,
        'format': 'mots',
        'focusable': true,
        'id': 'rec0hSrPM5bHqMP8T',
        'instruction': 'Quelles sont les dates des deux guerres mondiales ?',
        'locales': [
          'fr',
          'fr-fr',
        ],
        'preview': 'http://staging.pix.fr/challenges/rec0hSrPM5bHqMP8T/preview',
        'proposals': 'Dates :\n.${date1}\n.${date2}',
        'skillIds': [
          'recWAozQQmkLzs15C',
        ],
        'skills': [
          'recWAozQQmkLzs15C',
        ],
        'solution': 'groupe1:\n- 14 18\n- 1914 1918\ngroupe2:\n- 39 45\n- 1939 1945',
        'status': 'validé',
        't1Status': false,
        't2Status': false,
        't3Status': false,
        'type': 'QROCM-dep',
      },
      {
        'airtableId': 'rec2ZkgH8IDwAoeA6',
        'alpha': null,
        'alternativeInstruction': '',
        'autoReply': false,
        'competenceId': 'recoVElv3xmVppK5a',
        'delta': null,
        'format': 'mots',
        'id': 'rec2ZkgH8IDwAoeA6',
        'instruction': 'Quelle est la réponse à la vie ?',
        'locales': [
          'fr',
          'fr-fr',
        ],
        'preview': 'http://staging.pix.fr/challenges/rec2ZkgH8IDwAoeA6/preview',
        'proposals': 'Réponse : ${quarantedeux}',
        'skillIds': [
          'reckUgdmbWJtjUOcQ',
        ],
        'skills': [
          'reckUgdmbWJtjUOcQ',
        ],
        'solution': '42\nquarante-deux',
        'status': 'validé',
        't1Status': false,
        't2Status': false,
        't3Status': false,
        'type': 'QROC',
      },
      {
        'airtableId': 'rec4RHc2v3am5VJvY',
        'alpha': null,
        'alternativeInstruction': '',
        'autoReply': false,
        'competenceId': 'recxf7xB2qNV8g5ZT',
        'delta': null,
        'format': 'mots',
        'id': 'rec4RHc2v3am5VJvY',
        'instruction': 'Qui a peint la Joconde ?',
        'locales': [
          'fr',
          'fr-fr',
        ],
        'preview': 'http://staging.pix.fr/challenges/rec4RHc2v3am5VJvY/preview',
        'proposals': 'Réponse : ${artiste}',
        'skillIds': [
          'recJz3fdjBhGBGnrj',
          'recKnuSvxV3WvOzgc',
        ],
        'skills': [
          'recJz3fdjBhGBGnrj',
          'recKnuSvxV3WvOzgc',
        ],
        'solution': 'Léonard de Vinci\nde Vinci\nVinci',
        'status': 'validé',
        't1Status': false,
        't2Status': false,
        't3Status': false,
        'type': 'QROC',
      },
      {
        'airtableId': 'recc3QU4nKAk4byGv',
        'alpha': null,
        'alternativeInstruction': '',
        'autoReply': false,
        'competenceId': 'recxlJqKdbWHHFZMQ',
        'delta': null,
        'format': 'mots',
        'id': 'recc3QU4nKAk4byGv',
        'instruction': 'Quelle est la capitale de la Lettonie ?',
        'locales': [
          'fr',
          'fr-fr',
        ],
        'preview': 'http://staging.pix.fr/challenges/recc3QU4nKAk4byGv/preview',
        'proposals': 'Réponse : ${ville}',
        'skillIds': [
          'recJieHaORILprKhL',
        ],
        'skills': [
          'recJieHaORILprKhL',
        ],
        'solution': 'Riga\n',
        'status': 'validé sans test',
        't1Status': false,
        't2Status': false,
        't3Status': false,
        'type': 'QROC',
      },
      {
        'airtableId': 'recc5bnzo6lvwyIgD',
        'alpha': null,
        'alternativeInstruction': '',
        'autoReply': false,
        'competenceId': 'recH9MjIzN54zXlwr',
        'delta': null,
        'embedHeight': 500,
        'format': 'mots',
        'id': 'recc5bnzo6lvwyIgD',
        'instruction': 'Combien font 2 x 2 ?',
        'locales': [
          'fr',
          'fr-fr',
        ],
        'preview': 'http://staging.pix.fr/challenges/recc5bnzo6lvwyIgD/preview',
        'proposals': 'Réponse: ${total}',
        'skillIds': [
          'recxpiQQionAnay9A',
        ],
        'skills': [
          'recxpiQQionAnay9A',
        ],
        'solution': '4\nquatre',
        'status': 'périmé',
        't1Status': false,
        't2Status': false,
        't3Status': false,
        'type': 'QROC',
      },
      {
        'airtableId': 'receffAhZMTJDx5Zv',
        'alpha': null,
        'alternativeInstruction': '',
        'autoReply': false,
        'competenceId': 'recxf7xB2qNV8g5ZT',
        'delta': null,
        'format': 'mots',
        'id': 'receffAhZMTJDx5Zv',
        'instruction': 'Où est exposé la Jocande ?',
        'locales': [
          'fr',
          'fr-fr',
        ],
        'preview': 'http://staging.pix.fr/challenges/receffAhZMTJDx5Zv/preview',
        'proposals': 'Réponse : ${douze}',
        'skillIds': [
          'recKnuSvxV3WvOzgc',
        ],
        'skills': [
          'recKnuSvxV3WvOzgc',
        ],
        'solution': 'Au Louvre\nLe Louvre\nLouvre\nLe musée du Louvre\nmusée du Louvre\nAu musée du Louvre',
        'status': 'validé',
        't1Status': false,
        't2Status': false,
        't3Status': false,
        'type': 'QROC',
      },
      {
        'airtableId': 'receWJAbh7Tib2uHb',
        'alpha': null,
        'alternativeInstruction': '',
        'autoReply': false,
        'competenceId': 'recxlJqKdbWHHFZMQ',
        'delta': null,
        'format': 'mots',
        'id': 'receWJAbh7Tib2uHb',
        'instruction': 'Quelle est la mer au sud de la France ?',
        'locales': [
          'fr',
          'fr-fr',
        ],
        'preview': 'http://staging.pix.fr/challenges/receWJAbh7Tib2uHb/preview',
        'proposals': 'Réponse : ${mer}',
        'skillIds': [
          'reclazvbevKgSNLRq',
        ],
        'skills': [
          'reclazvbevKgSNLRq',
        ],
        'solution': 'méditerranée\nmer méditerranée',
        'status': 'validé',
        't1Status': false,
        't2Status': false,
        't3Status': false,
        'type': 'QROC',
      },
    ],
    'competences': [
      {
        'areaId': 'recxjkrnVBVSI8RkS',
        'fullName': '1.1 Mathématiques',
        'id': 'recH9MjIzN54zXlwr',
        'index': '1.1',
        'name': 'Mathématiques',
        'nameEnUs': 'Mathématiques',
        'nameFrFr': 'Mathématiques',
        'origin': 'Pix',
        'skillIds': [
          'rec98HYctM7sl9Hyq',
          'recxpiQQionAnay9A',
          'rec0FDm4GbplWx3HX',
        ],
      },
      {
        'areaId': 'recxjkrnVBVSI8RkS',
        'fullName': '1.3 Histoire',
        'id': 'recKxnZJh5dyRCQQn',
        'index': '1.3',
        'name': 'Histoire',
        'nameEnUs': 'Histoire',
        'nameFrFr': 'Histoire',
        'origin': 'Pix',
        'skillIds': [
          'recrtA98cABIlBjCY',
          'recWAozQQmkLzs15C',
          'rechlK03j6u46McW4',
          'recykZlIZckeSq4xI',
        ],
      },
      {
        'areaId': 'recZwplcNbXVlDVlx',
        'fullName': '2.2 Philosophie',
        'id': 'recoVElv3xmVppK5a',
        'index': '2.2',
        'name': 'Philosophie',
        'nameEnUs': 'Philosophie',
        'nameFrFr': 'Philosophie',
        'origin': 'Pix',
        'skillIds': [
          'rec3ikwFFMr5RkSdp',
          'recdFsWU9ij5bXZhD',
          'reckUgdmbWJtjUOcQ',
        ],
      },
      {
        'areaId': 'recZwplcNbXVlDVlx',
        'fullName': '2.1 Arts',
        'id': 'recxf7xB2qNV8g5ZT',
        'index': '2.1',
        'name': 'Arts',
        'nameEnUs': 'Arts',
        'nameFrFr': 'Arts',
        'origin': 'Pix',
        'skillIds': [
          'recKnuSvxV3WvOzgc',
          'recJz3fdjBhGBGnrj',
        ],
      },
      {
        'areaId': 'recxjkrnVBVSI8RkS',
        'fullName': '1.2 Géographie',
        'id': 'recxlJqKdbWHHFZMQ',
        'index': '1.2',
        'name': 'Géographie',
        'nameEnUs': 'Géographie',
        'nameFrFr': 'Géographie',
        'origin': 'Pix',
        'skillIds': [
          'recJieHaORILprKhL',
          'reclazvbevKgSNLRq',
          'recLsQng435HgiXY2',
        ],
      },
      {
        'areaId': 'recxjkrnVBVSI8RkS',
        'fullName': '1.4 Français',
        'id': 'recZ1Gm4rud4zLhbF',
        'index': '1.4',
        'name': 'Français',
        'nameEnUs': 'Français',
        'nameFrFr': 'Français',
        'origin': 'Pix',
        'skillIds': [
          'recffgcUr12Ocafm6',
          'rece5OVLmHGjLfAPB',
          'recaL3AMSpsLdvwk1',
        ],
      },
    ],
    'courses': [
      {
        'adaptive': false,
        'challenges': [
          'recPbD9nJKGqmopDI',
          'recpl233mvKQqIzZe',
          'recqVyHUcAqNEb4qs',
        ],
        'id': 'rec5UecGJn0kr2odZ',
        'name': 'Démo essentiels',
      },
      {
        'adaptive': true,
        'competences': [
          'recxf7xB2qNV8g5ZT',
        ],
        'id': 'rec8nO3qZEI41BL5G',
        'name': '2.1 Arts',
      },
      {
        'adaptive': true,
        'competences': [
          'recZ1Gm4rud4zLhbF',
        ],
        'id': 'recBXNHQwClYhDuwq',
        'name': '1.4 Français',
      },
      {
        'adaptive': true,
        'competences': [
          'recxlJqKdbWHHFZMQ',
        ],
        'id': 'recbY79yZlzPqK4uB',
        'name': '1.2 Géographie',
      },
      {
        'adaptive': true,
        'competences': [
          'recoVElv3xmVppK5a',
        ],
        'id': 'recCSTyGclCCJ0iyc',
        'name': '2.2 Philosophie',
      },
      {
        'adaptive': false,
        'id': 'recKUFCoFaJD87SMi',
        'name': 'Test avec épreuve timée',
      },
      {
        'adaptive': true,
        'competences': [
          'recH9MjIzN54zXlwr',
        ],
        'id': 'recLFghcJgbaQreUT',
        'name': '1.1 Mathématiques',
      },
      {
        'adaptive': true,
        'competences': [
          'recKxnZJh5dyRCQQn',
        ],
        'id': 'recNtSu9uN3pjWOQJ',
        'name': '1.3 Histoire',
      },
    ],
    'skills': [
      {
        'competenceId': 'recH9MjIzN54zXlwr',
        'hintStatus': 'no status',
        'id': 'rec0FDm4GbplWx3HX',
        'learningMoreTutorialIds': [],
        'level': 1,
        'name': 'multiplication1',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'rec5WT8N6ksCs7IdT',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recoVElv3xmVppK5a',
        'hintStatus': 'no status',
        'id': 'rec3ikwFFMr5RkSdp',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'philosophes2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recWlYOH61aFXbij9',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recH9MjIzN54zXlwr',
        'hintStatus': 'no status',
        'id': 'rec98HYctM7sl9Hyq',
        'learningMoreTutorialIds': [
          'recMVBo1dTCxncXqv',
        ],
        'level': 2,
        'name': 'addition2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recSKNxZX5KKrv3Lu',
        'tutorialIds': [
          'recMVBo1dTCxncXqv',
        ],
      },
      {
        'competenceId': 'recZ1Gm4rud4zLhbF',
        'hintStatus': 'no status',
        'id': 'recaL3AMSpsLdvwk1',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'vocabulaire2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recHE60AdMfB54ckt',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recoVElv3xmVppK5a',
        'hintStatus': 'no status',
        'id': 'recdFsWU9ij5bXZhD',
        'learningMoreTutorialIds': [],
        'level': 5,
        'name': 'philosophes5',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recWlYOH61aFXbij9',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recZ1Gm4rud4zLhbF',
        'hintStatus': 'no status',
        'id': 'rece5OVLmHGjLfAPB',
        'learningMoreTutorialIds': [],
        'level': 4,
        'name': 'grammaire4',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recY9qnbpPoNCowf8',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recZ1Gm4rud4zLhbF',
        'hintStatus': 'no status',
        'id': 'recffgcUr12Ocafm6',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'grammaire2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recY9qnbpPoNCowf8',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recKxnZJh5dyRCQQn',
        'hintStatus': 'no status',
        'id': 'rechlK03j6u46McW4',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'présidents2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recP3qhozxftiQyH5',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recxlJqKdbWHHFZMQ',
        'hintStatus': 'no status',
        'id': 'recJieHaORILprKhL',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'capitales2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recR9y2U4RBJdhZ1c',
        'tutorialIds': [
          'recTqUHAm2x7yOfDN',
        ],
      },
      {
        'competenceId': 'recxf7xB2qNV8g5ZT',
        'hintStatus': 'no status',
        'id': 'recJz3fdjBhGBGnrj',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'artistes2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'rec9dwOqgka7iojCb',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recxf7xB2qNV8g5ZT',
        'hintStatus': 'no status',
        'id': 'recKnuSvxV3WvOzgc',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'œuvres2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recVYYbDM3DfEmRyX',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recoVElv3xmVppK5a',
        'hintStatus': 'no status',
        'id': 'reckUgdmbWJtjUOcQ',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'concepts2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'rec6GZcGX6V0oSnrB',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recxlJqKdbWHHFZMQ',
        'hintStatus': 'no status',
        'id': 'reclazvbevKgSNLRq',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'mers2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recKRW0m1Reo5eq3h',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recxlJqKdbWHHFZMQ',
        'hintStatus': 'no status',
        'id': 'recLsQng435HgiXY2',
        'learningMoreTutorialIds': [],
        'level': 3,
        'name': 'mers3',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recKRW0m1Reo5eq3h',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recKxnZJh5dyRCQQn',
        'hintStatus': 'no status',
        'id': 'recrtA98cABIlBjCY',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'batailles2',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'rec5DesjmlUemhJCJ',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recKxnZJh5dyRCQQn',
        'hintStatus': 'no status',
        'id': 'recWAozQQmkLzs15C',
        'learningMoreTutorialIds': [],
        'level': 3,
        'name': 'batailles3',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'rec5DesjmlUemhJCJ',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recH9MjIzN54zXlwr',
        'hintStatus': 'no status',
        'id': 'recxpiQQionAnay9A',
        'learningMoreTutorialIds': [],
        'level': 2,
        'name': 'multiplication2',
        'pixValue': 0,
        'status': 'périmé',
        'tubeId': 'rec5WT8N6ksCs7IdT',
        'tutorialIds': [],
      },
      {
        'competenceId': 'recKxnZJh5dyRCQQn',
        'hintStatus': 'no status',
        'id': 'recykZlIZckeSq4xI',
        'learningMoreTutorialIds': [],
        'level': 3,
        'name': 'présidents3',
        'pixValue': 4,
        'status': 'actif',
        'tubeId': 'recP3qhozxftiQyH5',
        'tutorialIds': [],
      },
    ],
    'tubes': [
      {
        'competenceId': 'recKxnZJh5dyRCQQn',
        'id': 'rec5DesjmlUemhJCJ',
        'name': 'batailles',
        'practicalTitleEnUs': 'Batailles',
        'practicalTitleFrFr': 'Batailles',
      },
      {
        'competenceId': 'recH9MjIzN54zXlwr',
        'id': 'rec5WT8N6ksCs7IdT',
        'name': 'multiplication',
        'practicalTitleEnUs': 'Mutliplication',
        'practicalTitleFrFr': 'Mutliplication',
      },
      {
        'competenceId': 'recoVElv3xmVppK5a',
        'id': 'rec6GZcGX6V0oSnrB',
        'name': 'concepts',
        'practicalTitleEnUs': 'Concepts',
        'practicalTitleFrFr': 'Concepts',
      },
      {
        'competenceId': 'recxf7xB2qNV8g5ZT',
        'id': 'rec9dwOqgka7iojCb',
        'name': 'artistes',
        'practicalTitleEnUs': 'Artistes',
        'practicalTitleFrFr': 'Artistes',
      },
      {
        'competenceId': 'recZ1Gm4rud4zLhbF',
        'id': 'recHE60AdMfB54ckt',
        'name': 'vocabulaire',
        'practicalTitleEnUs': 'Vocabulaire',
        'practicalTitleFrFr': 'Vocabulaire',
      },
      {
        'competenceId': 'recxlJqKdbWHHFZMQ',
        'id': 'recKRW0m1Reo5eq3h',
        'name': 'mers',
        'practicalTitleEnUs': 'Mers',
        'practicalTitleFrFr': 'Mers',
      },
      {
        'competenceId': 'recKxnZJh5dyRCQQn',
        'id': 'recP3qhozxftiQyH5',
        'name': 'présidents',
        'practicalTitleEnUs': 'Présidents',
        'practicalTitleFrFr': 'Présidents',
      },
      {
        'competenceId': 'recZ1Gm4rud4zLhbF',
        'id': 'recphrRTVShqa389P',
        'name': 'conjugaison',
        'practicalTitleEnUs': 'Conjugaison',
        'practicalTitleFrFr': 'Conjugaison',
      },
      {
        'competenceId': 'recxlJqKdbWHHFZMQ',
        'id': 'recR9y2U4RBJdhZ1c',
        'name': 'capitales',
        'practicalTitleEnUs': 'Capitales',
        'practicalTitleFrFr': 'Capitales',
      },
      {
        'competenceId': 'recH9MjIzN54zXlwr',
        'id': 'recSKNxZX5KKrv3Lu',
        'name': 'addition',
        'practicalTitleEnUs': 'Addition',
        'practicalTitleFrFr': 'Addition',
      },
      {
        'competenceId': 'recxf7xB2qNV8g5ZT',
        'id': 'recVYYbDM3DfEmRyX',
        'name': 'œuvres',
        'practicalTitleEnUs': 'Œuvres',
        'practicalTitleFrFr': 'Œuvres',
      },
      {
        'competenceId': 'recoVElv3xmVppK5a',
        'id': 'recWlYOH61aFXbij9',
        'name': 'philosophes',
        'practicalTitleEnUs': 'Philosophes',
        'practicalTitleFrFr': 'Philosophes',
      },
      {
        'competenceId': 'recZ1Gm4rud4zLhbF',
        'id': 'recY9qnbpPoNCowf8',
        'name': 'grammaire',
        'practicalTitleEnUs': 'Grammaire',
        'practicalTitleFrFr': 'Grammaire',
      },
    ],
    'tutorials': [
      {
        'duration': '00:00:30',
        'format': 'page',
        'furtherInformation': [
          'rec98HYctM7sl9Hyq',
        ],
        'id': 'recMVBo1dTCxncXqv',
        'link': 'https://education.francetv.fr/matiere/education-aux-medias/cinquieme/article/ne-pas-confondre-le-web-et-internet',
        'locale': 'fr-fr',
        'source': 'France tv éducation',
        'title': 'Ne pas confondre le web et Internet',
        'tutorialForSkills': [
          'rec98HYctM7sl9Hyq',
        ],
      },
      {
        'duration': '00:00:30',
        'format': 'page',
        'id': 'recTqUHAm2x7yOfDN',
        'link': 'https://education.francetv.fr/matiere/education-aux-medias/cinquieme/article/ne-pas-confondre-le-web-et-internet',
        'locale': 'fr-fr',
        'source': 'France tv éducation',
        'title': 'Les capitales du monde',
        'tutorialForSkills': [
          'recJieHaORILprKhL',
        ],
      },
    ],
  };
}

module.exports = mockLcmsAirtableData;

