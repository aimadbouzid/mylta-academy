import * as frData from './fr.js';

import { resourceCategories as enCategories } from './categories_en.js';
import { freeCombosData as enCombos1 } from './combos_en_part1.js';
import { freeCombosData2 as enCombos2 } from './combos_en_part2.js';
import { masterclassCategories as enMasterclass, labIdeasData as enLab } from './masterclass_lab_en.js';

import { resourceCategories as arCategories } from './categories_ar.js';
import { freeCombosData as arCombos1 } from './combos_ar_part1.js';
import { freeCombosData2 as arCombos2 } from './combos_ar_part2.js';
import { masterclassCategories as arMasterclass, labIdeasData as arLab } from './masterclass_lab_ar.js';

export const resources = {
  fr: {
    resourceCategories: frData.resourceCategories,
    freeCombosData: frData.freeCombosData,
    masterclassCategories: frData.masterclassCategories,
    labIdeasData: frData.labIdeasData,
  },
  en: {
    resourceCategories: enCategories,
    freeCombosData: [...enCombos1, ...enCombos2],
    masterclassCategories: enMasterclass,
    labIdeasData: enLab,
  },
  ar: {
    resourceCategories: arCategories,
    freeCombosData: [...arCombos1, ...arCombos2],
    masterclassCategories: arMasterclass,
    labIdeasData: arLab,
  }
};
