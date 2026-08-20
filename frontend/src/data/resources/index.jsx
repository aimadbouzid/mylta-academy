import * as frData from './fr.jsx';

import { resourceCategories as enCategories } from './categories_en.jsx';
import { freeCombosData as enCombos1 } from './combos_en_part1.jsx';
import { freeCombosData2 as enCombos2 } from './combos_en_part2.jsx';
import { freeCombosData3 as enCombos3 } from './combos_en_part3.jsx';
import { masterclassCategories as enMasterclass, labIdeasData as enLab } from './masterclass_lab_en.jsx';

import { resourceCategories as arCategories } from './categories_ar.jsx';
import { freeCombosData as arCombos1 } from './combos_ar_part1.jsx';
import { freeCombosData2 as arCombos2 } from './combos_ar_part2.jsx';
import { freeCombosData3 as arCombos3 } from './combos_ar_part3.jsx';
import { masterclassCategories as arMasterclass, labIdeasData as arLab } from './masterclass_lab_ar.jsx';

export const resources = {
  fr: {
    resourceCategories: frData.resourceCategories,
    freeCombosData: frData.freeCombosData,
    masterclassCategories: frData.masterclassCategories,
    labIdeasData: frData.labIdeasData,
  },
  en: {
    resourceCategories: enCategories,
    freeCombosData: [...enCombos1, ...enCombos2, ...enCombos3],
    masterclassCategories: enMasterclass,
    labIdeasData: enLab,
  },
  ar: {
    resourceCategories: arCategories,
    freeCombosData: [...arCombos1, ...arCombos2, ...arCombos3],
    masterclassCategories: arMasterclass,
    labIdeasData: arLab,
  }
};
