import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Compass,
  Copy,
  Fuel,
  Info,
  Luggage,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Waves,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { findDestinationProfile, buildDestinationContext, getTopVehicleExamples, getTieredVehicleRecommendations, buildOneLinerSummary, buildSearchKeywords, buildWhyNotAdvice, buildTradeOffAdvice } from '../utils/carRecommendationDataHelpers.js';
import { getInsuranceAdviceByScenario, getPlatformInsurancePlans, INSURANCE_DISCLAIMER } from '../utils/insuranceUtils.js';

/* ========================================================================
   目的地类型 → 具体目的地映射（用于获取 JSON 路线数据）
   ======================================================================== */

const DEST_TYPE_TO_DESTINATION = {
  'city-short': '城区近郊轻自驾',
  'island-leisure': '海岛滨海环线',
  'mountain-plateau': '山地高原山路',
  'grassland-gobi': '草原戈壁大长线',
  'yunnan-mountain': '山地高原山路',
  'grassland-long': '草原戈壁大长线',
  'loop-long': '草原戈壁大长线',
  unsure: '',
};

/* ========================================================================
   表单选项定义
   ======================================================================== */

const destinationTypeOptions = [
  { value: 'city-short', label: '城区近郊', icon: MapPin },
  { value: 'island-leisure', label: '海岛滨海', icon: Waves },
  { value: 'mountain-plateau', label: '山地高原', icon: Mountain },
  { value: 'grassland-gobi', label: '草原戈壁', icon: Compass },
];

function getDestinationTypeLabel(value) {
  return destinationTypeOptions.find((o) => o.value === value)?.label || '这类路线';
}

const peopleOptions = [
  { value: '1-2', label: '1-2 人', icon: UserCheck },
  { value: '3-4', label: '3-4 人', icon: Users },
  { value: '5', label: '5 人', icon: Users },
  { value: '6+', label: '6 人及以上', icon: Users },
];

const luggageOptions = [
  { value: 'light', label: '少：背包 / 登机箱为主', icon: Luggage },
  { value: 'medium', label: '中：2-3 个行李箱', icon: Luggage },
  { value: 'heavy', label: '多：多人行李 / 摄影器材 / 露营装备', icon: Luggage },
];

const energyPreferenceOptions = [
  { value: 'flexible', label: '不限能源，系统推荐' },
  { value: 'oil', label: '油车优先，补能省心' },
  { value: 'hybrid', label: '混动 / 增程优先' },
  { value: 'ev', label: '纯电 / 新能源优先' },
];

const drivingProficiencyOptions = [
  { value: 'beginner', label: '新手：更重视好开好停' },
  { value: 'normal', label: '普通：日常驾驶没问题' },
  { value: 'experienced', label: '熟练：能接受山路长途' },
];

/* ========================================================================
   推荐引擎
   ======================================================================== */

function generateRecommendation(form) {
  const profile = buildProfile(form);
  const destAdjust = applyDestination(form.destinationType, profile);
  const prefResult = applyPreference(form.energyPreference, destAdjust);

  // 根据目的地类型自动匹配具体的路线数据
  const derivedDest = DEST_TYPE_TO_DESTINATION[form.destinationType] || '';
  const destProfile = derivedDest ? findDestinationProfile(derivedDest) : null;
  const destContext = derivedDest && destProfile ? buildDestinationContext(derivedDest) : null;
  const optimizedVehicles = derivedDest ? getTieredVehicleRecommendations(derivedDest, {
    peopleCount: form.peopleCount,
    luggageLevel: form.luggage,
    energyPreference: form.energyPreference,
    drivingPreference: form.drivingProficiency,
  }) : [];
  const recommendedProfile = buildOptimizedPrimaryProfile(prefResult, optimizedVehicles);

  const directions = buildDirections(recommendedProfile, form);
  const reasons = buildReasons(recommendedProfile, form, destContext);
  const notRecommended = buildNotRecommended(recommendedProfile, form, destContext);
  const evScore = calculateEvScore(form);
  const evLevel = getEvLevel(evScore);

  const destTypeLabel = destinationTypeOptions.find((o) => o.value === form.destinationType)?.label || '未选择';

  return {
    tripProfile: {
      destination: destTypeLabel,
      type: destTypeLabel,
      people: peopleOptions.find((o) => o.value === form.peopleCount)?.label || '',
      luggage: luggageOptions.find((o) => o.value === form.luggage)?.label || '',
      energyPreference: energyPreferenceOptions.find((o) => o.value === form.energyPreference)?.label || '',
      drivingProficiency: drivingProficiencyOptions.find((o) => o.value === form.drivingProficiency)?.label || '',
    },
    primary: recommendedProfile,
    reasons,
    notRecommended,
    directions,
    energyAdvice: recommendedProfile.energyAdvice,
    extraNotes: recommendedProfile.extraNotes || [],
    evScore: evLevel,
    evRawScore: evScore,
    destContext,
    derivedDest,
  };
}

/* —— 第一步：人数 + 行李 → 基础车型 —— */

function buildProfile(form) {
  // 仅作为 curated 数据未命中时的轻量 fallback，不作为车型推荐主数据源。
  // 真实推荐车型来自 src/data/car-recommendation/index.js 中的 curated JSON。
  const key = `${form.peopleCount}|${form.luggage}`;
  const map = {
    '1-2|light':  { category: '轿车 / 小型 SUV',           models: '比亚迪海鸥、小米 SU7、宝马 3系', size: 'compact', energyOpen: true },
    '1-2|medium': { category: '轿车 / 紧凑型 SUV',         models: '小米 SU7、蔚来 ET5T、特斯拉 Model Y', size: 'compact-mid', energyOpen: true },
    '1-2|heavy':  { category: '紧凑型 SUV / 中型 SUV',     models: '特斯拉 Model Y、理想 L6、坦克 300', size: 'mid', energyOpen: true },
    '3-4|light':  { category: '轿车 / 紧凑型 SUV',         models: '小米 SU7、蔚来 ET5T、特斯拉 Model Y', size: 'compact-mid', energyOpen: true },
    '3-4|medium': { category: '中型 SUV',                  models: '理想 L6、问界 M7、特斯拉 Model Y', size: 'mid', energyOpen: true },
    '3-4|heavy':  { category: '中大型 SUV',                models: '小米 YU7、理想 L9、问界 M8', size: 'mid-large', energyOpen: true },
    '5|light':    { category: '中大型 SUV / MPV',          models: '问界 M7、理想 L9、蔚来 ES8', size: 'large', energyOpen: true },
    '5|medium':   { category: '中大型 SUV / 六座 SUV',     models: '问界 M8、理想 L9、理想 L8', size: 'large', energyOpen: true },
    '5|heavy':    { category: '中大型 SUV / 六座 SUV',     models: '问界 M9、理想 L9、理想 L8', size: 'large', energyOpen: true },
    '6+|light':   { category: '六座 SUV 优先',             models: '问界 M8、理想 L9、理想 L8', size: 'xlarge', energyOpen: false },
    '6+|medium':  { category: '六座 SUV 优先',             models: '问界 M9、理想 L9、理想 L8', size: 'xlarge', energyOpen: false },
    '6+|heavy':   { category: '六座 SUV 优先',             models: '问界 M9、蔚来 ES8、理想 L9', size: 'xlarge', energyOpen: false },
  };
  return map[key] || map['3-4|medium'];
}

/* —— 第二步：目的地类型修正 —— */

function applyDestination(destType, base) {
  const energy = { ...base };
  energy.destNotes = [];

  switch (destType) {
    case 'city-short':
      energy.destNotes.push('城区近郊以铺装路和平路为主，停车和掉头频率更高，可以偏经济、好开好停的车型。');
      energy.energyType = 'both';
      energy.energyLabel = '油车 / 新能源均可';
      energy.energyLevel = 'both';
      energy.destBias = 'economy';
      break;

    case 'island-leisure':
      energy.destNotes.push('海岛滨海路线通常路况轻松、海拔低，经济轿车和紧凑型 SUV 完全够用。');
      energy.destNotes.push('补能条件明确的海岛/滨海城市对新能源更友好，纯电、插混和增程都可以纳入选择。');
      energy.energyType = 'electric';
      energy.energyLabel = '新能源友好';
      energy.energyLevel = 'ev-friendly';
      energy.destBias = 'economy-ev';
      break;

    case 'mountain-plateau':
      energy.destNotes.push('山地高原坡多弯多、海拔变化明显，SUV 的视野、通过性和动力储备更有价值。');
      energy.destNotes.push('低动力车型在高原和连续爬坡路段可能吃力，建议优先选择油车、混动或增程。');
      energy.energyType = 'oil';
      energy.energyLabel = '建议油车 / 增程';
      energy.energyLevel = 'recommend-oil';
      energy.destBias = 'suv-up';
      break;

    case 'yunnan-mountain':
      energy.destNotes.push('云贵山地更像“城市跨点 + 山路爬升”的组合，既要舒适性，也要动力和补能容错率。');
      energy.destNotes.push('纯电不是完全不可行，但山路和海拔变化会放大续航不确定性，增程或混动更稳。');
      energy.energyType = 'oil';
      energy.energyLabel = '建议混动 / 增程';
      energy.energyLevel = 'recommend-oil';
      energy.destBias = 'balanced-suv';
      break;

    case 'grassland-gobi':
    case 'grassland-long':
    case 'loop-long':
      energy.destNotes.push('草原戈壁通常距离长、路段空旷，舒适性、可靠性和续航容错率都要往前排。');
      energy.destNotes.push('增程或油车在这个场景下更稳：既能应对长距离，也能降低补能焦虑。');
      energy.energyType = 'oil';
      energy.energyLabel = '建议油车 / 增程';
      energy.energyLevel = 'recommend-oil-strong';
      energy.destBias = 'mid-suv-up';
      break;

    case 'unsure':
    default:
      energy.destNotes.push('不确定路线时，建议优先考虑适应性强、保有量大的中型 SUV。');
      energy.energyType = 'oil';
      energy.energyLabel = '建议油车 / 增程';
      energy.energyLevel = 'recommend-oil';
      energy.destBias = 'neutral';
      break;
  }

  return energy;
}

/* —— 第三步：能源偏好修正 —— */

function applyPreference(energyPreference, profile) {
  const result = { ...profile, prefNotes: [], extraNotes: [] };
  result.energyAdvice = {
    recommended: profile.energyLabel || '油车',
    level: profile.energyLevel || 'recommend-oil',
    reason: profile.destNotes.join(''),
  };

  switch (energyPreference) {
    case 'oil':
      result.prefNotes.push('优先油车或油电混动，适合不想额外规划充电补能的行程。');
      result.prefBias = 'reliable';
      break;

    case 'hybrid':
      result.prefNotes.push('优先看插混、增程或油电混动，兼顾低能耗和长途补能容错率。');
      result.energyAdvice = {
        recommended: '混动 / 增程优先',
        level: profile.energyLevel === 'ev-friendly' ? 'ev-friendly' : 'recommend-extended',
        reason: '混动和增程能兼顾电驱体验与加油补能，对跨城和路线不确定的行程更稳。',
      };
      result.prefBias = 'hybrid';
      break;

    case 'ev':
      result.prefNotes.push('优先看纯电、插混和增程车型，日常使用成本更低、驾驶静谧性更好。');
      if (profile.energyLevel === 'recommend-oil-strong') {
        result.extraNotes.push('这个目的地充电条件可能不够完善。如果坚持选新能源，建议优先看增程车型，并提前规划沿途补能点。');
        result.energyAdvice = {
          recommended: '增程（折中方案）',
          level: 'recommend-extended',
          reason: '你偏好新能源，但这个目的地更适合油车。增程是兼顾电驱体验和补能便利的折中选择。',
        };
      } else if (profile.energyLevel === 'recommend-oil') {
        result.extraNotes.push('可以考虑增程车型，兼顾电驱静谧性和加油补能的便利。');
        result.energyAdvice = {
          recommended: '增程 / 纯电（需提前确认充电条件）',
          level: 'recommend-extended',
          reason: '新能源在这个目的地可行，但建议提前确认沿途充电站分布。增程车型可以作为安全网。',
        };
      }
      result.prefBias = 'ev';
      break;

    case 'flexible':
    default:
      result.prefBias = 'neutral';
      break;
  }

  return result;
}

/* —— 第五步：组装推荐方向列表 —— */

function buildDirections(profile, form) {
  const firstChoice = [];
  const alternatives = [];
  const cautious = [];

  const sizeOrder = ['compact', 'compact-mid', 'mid', 'mid-large', 'large', 'xlarge'];
  const baseIdx = sizeOrder.indexOf(profile.size);

  // 首选
  firstChoice.push(`${profile.category}（${profile.models}）`);

  // 可选：同级不同能源
  if (profile.energyLevel === 'recommend-oil' || profile.energyLevel === 'recommend-oil-strong') {
    if (profile.size !== 'xlarge' && form.energyPreference === 'ev') {
      alternatives.push('增程 SUV（理想 L 系列、问界 M 系列）— 兼顾电驱和补能便利');
    }
    alternatives.push('同级别混动车型 — 油耗更低，适合长途');
  } else if (profile.energyLevel === 'ev-friendly' || profile.energyLevel === 'both') {
    alternatives.push('同级别纯电车型 — 使用成本更低，适合充电方便的行程');
    alternatives.push('同级别增程车型 — 无续航焦虑的电驱体验');
  }

  // 可选：预算降级
  // 可选：舒适升级
  if (
    (form.drivingProficiency === 'experienced' || ['mountain-plateau', 'grassland-gobi', 'grassland-long', 'loop-long'].includes(form.destinationType)) &&
    baseIdx < sizeOrder.length - 1
  ) {
    const upSize = sizeOrder[baseIdx + 1];
    if (upSize !== 'xlarge' || form.peopleCount === '6+') {
      alternatives.push(`如果预算允许，${sizeLabel(upSize)}的舒适性和空间更好`);
    }
  }

  if (form.drivingProficiency === 'beginner') {
    alternatives.push('新手友好车型 — 优先好开好停、视野清楚、辅助配置完整');
  }

  // 谨慎
  if (['mountain-plateau', 'yunnan-mountain', 'grassland-gobi', 'grassland-long', 'loop-long'].includes(form.destinationType)) {
    cautious.push('低动力经济型轿车 — 高原或长途路段动力储备可能不足');
    if (form.destinationType === 'grassland-gobi' || form.destinationType === 'grassland-long' || form.destinationType === 'loop-long') {
      cautious.push('纯电车型（无增程）— 偏远路段充电设施不确定，需要仔细规划补能');
    }
    if (form.destinationType === 'mountain-plateau' || form.destinationType === 'yunnan-mountain') {
      cautious.push('纯电车型 — 高原低温可能影响续航，建议优先确认沿途充电条件');
    }
  }
  if (form.peopleCount === '6+' && profile.category.includes('SUV')) {
    cautious.push('大型 SUV 的第三排 — 长时间乘坐舒适性通常不如 MPV');
  }
  if (form.luggage === 'heavy' && profile.size === 'compact-mid') {
    cautious.push('紧凑型 SUV — 后备箱空间可能偏紧，建议先确认行李是否装得下');
  }

  return { firstChoice, alternatives, cautious };
}

function sizeLabel(size) {
  const map = {
    compact: '紧凑型 SUV',
    'compact-mid': '紧凑型 / 中型 SUV',
    mid: '中型 SUV',
    'mid-large': '中大型 SUV',
    large: '中大型 SUV / MPV',
    xlarge: 'MPV',
  };
  return map[size] || '中型 SUV';
}

/* —— 第六步：推荐理由（按目的地模板 + 动态调整） —— */

function buildReasons(profile, form, destContext) {
  const reasons = [];
  const dest = form.destinationType;
  const people = form.peopleCount;
  const luggage = form.luggage;
  const pref = form.energyPreference;

  // 主线：目的地场景描述 + 车型大方向
  reasons.push(mainAdvice(dest, people, luggage, profile, destContext));

  // 副线 1：人数和行李的具体建议
  const sizeNote = peopleLuggageNote(people, luggage, profile);
  if (sizeNote) reasons.push(sizeNote);

  // 副线 2：能源偏好对选择的影响
  const prefNote = preferenceTip(pref, dest, profile, destContext);
  if (prefNote) reasons.push(prefNote);

  return reasons;
}

function mainAdvice(dest, people, luggage, profile, destContext) {
  const category = profile.category;
  const destName = getDestinationTypeLabel(dest);
  const peopleLabel = people === '1-2' ? '1-2 人' : people === '3-4' ? '3-4 人' : people === '5' ? '5 人' : '6 人及以上';
  const heavySuffix = luggage === 'heavy' ? '；行李较多的话建议往上选一个尺寸级别，确保每人都有舒服的乘坐空间' : '';

  // —— 有真实目的地数据时，用目的地特征写文案 ——
  if (destContext) {
    if (people === '1-2') {
      if (dest === 'island-leisure' || destContext.altitudeRisk === '低') {
        return `${destName}路况轻松、补能便利，对车型硬性要求不高。${peopleLabel}出行，${category}完全够用，不用盲目租大车——把预算留给路上的体验和美食更划算。`;
      }
      if (dest === 'grassland-gobi' || dest === 'grassland-long' || dest === 'loop-long') {
        return `${destName}距离长、景点分散，路上时间比逛景点的时间可能还长。${peopleLabel}出行，${category}在空间和灵活性上比较均衡；如果预算允许，优先看舒适性更好的车型，长途下来差别很明显。`;
      }
      return `${destContext.highlights || `${destName}对车辆有一定要求`}。${peopleLabel}出行，${category}够用，但别只盯着最低租金——动力和可靠性比省几十块更重要。`;
    }

    if (people === '3-4') {
      if (dest === 'island-leisure' || destContext.altitudeRisk === '低') {
        return `${destName}路况整体友好，对车型硬性要求不高。${peopleLabel}出行，${category}在空间和舒适性上刚好${heavySuffix}。这个场景下新能源车型的使用成本优势也比较明显。`;
      }
      return `${destContext.highlights || `${destName}对车辆有一定要求`}。${peopleLabel}出行，${category}在空间和通过性上比较均衡${heavySuffix}。`;
    }

    // 5 人及以上
    if (dest === 'island-leisure' || destContext.altitudeRisk === '低') {
      return `${destName}路况轻松，${peopleLabel}出行，${category}在空间和舒适性上更合适——每个人都有舒服的位置比挤小车好很多。`;
    }
    return `${destName}这条路线，${peopleLabel}满员出行时车辆负载较大，${category}在动力和空间上更有余量，不建议选小排量或小型车。`;
  }

  // —— 兜底：无目的地数据时沿用原有的类型模板 ——
  switch (dest) {
    case 'grassland-gobi':
      if (people === '1-2') {
        return `草原戈壁路线通常距离长、路段空旷，补能和信号都需要留余量。1-2 人出行，${category}够用，但舒适性和续航容错率值得多看一眼。`;
      }
      if (people === '3-4') {
        return `草原戈壁路线不要只看日租金便宜。3-4 人出行，${category}在空间、舒适性和补能容错率上比较均衡${luggage === 'heavy' ? '；行李较多的话，中大型 SUV 或 MPV 会更从容' : ''}。`;
      }
      return `草原戈壁路线，${people === '5' ? '5 人' : '6 人及以上'}出行。这个人数在长途路线上，${category}是更合理的选择——每个人的乘坐舒适性都会被放大。`;

    case 'grassland-long':
      if (people === '1-2') {
        return `你的行程在草原或新疆这类长距离区域，景点之间距离较远，路上时间比逛景点的时间可能还长。1-2 人出行，${category}在空间和灵活性上比较均衡；如果预算允许，可以优先看舒适性更好的车型，长途下来差别很明显。`;
      }
      if (people === '3-4') {
        return `你的行程在草原或新疆这类长距离区域，景点之间距离较远。3-4 人出行，${category}是比较均衡的选择${luggage === 'heavy' ? '，但行李较多的话建议往上选一个尺寸级别，确保每人都有舒服的乘坐空间' : ''}。`;
      }
      return `你的行程在草原或新疆这类长距离区域，${people === '5' ? '5 人' : '6 人及以上'}出行。这个人数在长途路线上，${category}更合适——空间和舒适性都比强行挤小车好很多。`;

    case 'mountain-plateau':
      if (people === '1-2') {
        return `山地高原路线可能遇到爬坡、连续弯道、海拔变化和天气波动。1-2 人出行，${category}够用，但建议不要只盯着最低租金选车——动力储备和刹车稳定性在高海拔路段比省几十块租金更重要。`;
      }
      if (people === '3-4') {
        return `山地高原路线对车辆的动力、底盘和刹车稳定性要求比城市道路高。3-4 人出行，${category}在空间和通过性上比较理想${luggage === 'heavy' ? '；行李较多的话，建议确认后备箱能否装下所有人的装备' : ''}。`;
      }
      return `山地高原路线，${people === '5' ? '5 人' : '6 人及以上'}出行。满员跑山路时车辆负载较大，${category}在动力和制动上更有余量，不建议在这个场景下选小排量或小型车。`;

    case 'yunnan-mountain':
      if (people === '1-2') {
        return `云贵山地路线通常是城市间高速、国道和山路混合。1-2 人出行，${category}够用，但建议优先看动力更从容、座椅舒服的车型，别只按最低日租价选。`;
      }
      if (people === '3-4') {
        return `云贵山地路线会在城市道路和山路之间切换，3-4 人出行，${category}在空间、动力和灵活性上更均衡${luggage === 'heavy' ? '；行李较多的话，建议确认后备箱空间' : ''}。`;
      }
      return `云贵山地路线，${people === '5' ? '5 人' : '6 人及以上'}出行。满员加行李会放大动力和空间压力，${category}比小型车更合适。`;

    case 'island-leisure':
      if (people === '1-2') {
        return `海岛滨海路线整体比较友好，城市和景区之间距离通常可控。1-2 人出行，${category}完全够用，不用盲目租大车——把预算留给体验和美食可能更划算。`;
      }
      return `海岛滨海路线对车型的硬性要求不高。${people === '3-4' ? '3-4 人' : '多人'}出行，${category}在空间和舒适性上刚好${luggage === 'heavy' ? '；如果行李很多，可以考虑再往上选一级尺寸' : ''}。这个场景下新能源车型的使用成本优势也比较明显。`;

    case 'loop-long':
      if (people === '1-2') {
        return `戈壁大环线每天在车上的时间不短，偏远路段的补能和信号也更需要余量。1-2 人出行，${category}够用，但长途舒适性值得多花一点预算——好的座椅和隔音会让整趟体验差别很大。`;
      }
      if (people === '3-4') {
        return `戈壁大环线的车型选择不要只看日租金便宜。3-4 人出行，${category}在空间、舒适性和续航容错率上比较均衡${luggage === 'heavy' ? '；行李较多的话，中大型 SUV 或 MPV 的后备箱会更从容' : ''}。`;
      }
      return `戈壁大环线，${people === '5' ? '5 人' : '6 人及以上'}出行。这个人数在长途路线上，${category}是更合理的选择——每天开车时间较长的话，每个人的乘坐舒适性都会被放大。`;

    case 'city-short':
      if (people === '1-2') {
        return `城区近郊对车型的硬性要求不高，重点看预算、停车便利和舒适性就够了。1-2 人出行，${category}完全可以胜任，不需要为"万一用得上"而租一辆大车。`;
      }
      return `城区近郊，${people === '3-4' ? '3-4 人' : '多人'}出行。${category}在空间和灵活性上比较合适${luggage === 'heavy' ? '；行李较多的话可以考虑紧凑型 SUV 或中型 SUV' : ''}。城市周边充电方便，新能源车型的使用成本优势也比较突出。`;

    case 'unsure':
    default:
      if (people === '1-2') {
        return `你还没确定具体目的地类型，1-2 人出行的话，${category}是适应性最广的选择——无论最后去城市周边还是跑山路，都不会太吃力。`;
      }
      return `你还没确定具体目的地类型。${people === '3-4' ? '3-4 人' : '多人'}出行，建议优先看${category}——这个级别在各种路况下都有比较好的适应性，等目的地确定后再微调。`;
  }
}

function peopleLuggageNote(people, luggage, profile) {
  if (people === '6+' && luggage === 'heavy') {
    return '6 人及以上且行李较多，MPV 通常是比大型 SUV 更务实的选择——第三排乘坐舒适性和后备箱空间通常更好。';
  }
  if (people === '6+') {
    return '6 人及以上出行，建议优先看 MPV。大型 SUV 的第三排应急可以，但长途旅行中 MPV 的空间布局通常更合理。';
  }
  if (people === '5' && luggage === 'heavy') {
    return '5 人满员且行李多的话，建议重点确认后备箱空间——有些中大型 SUV 满员后行李空间会明显缩水，MPV 可能更从容。';
  }
  if (luggage === 'heavy' && profile.size === 'compact-mid') {
    return '行李较多的情况下，建议租车前去平台看看实拍的后备箱照片，确认能不能装下所有人的箱子。';
  }
  return null;
}

function preferenceTip(pref, dest, profile, destContext) {
  const destName = getDestinationTypeLabel(dest);

  switch (pref) {
    case 'ev':
      if (dest === 'grassland-gobi' || dest === 'grassland-long' || dest === 'loop-long') {
        if (destContext && destContext.energyHint) {
          return `你偏好新能源，但${destName}补能条件需要提前确认。${destContext.energyHint}`;
        }
        return '你偏好新能源，但这类长距离路线补能条件需要提前确认。增程车型是兼顾电驱体验和长途补能安全的折中选择——既有新能源的静谧和低成本，又不需要完全依赖充电站。';
      }
      if (dest === 'mountain-plateau' || dest === 'yunnan-mountain') {
        if (destContext && destContext.energyHint) {
          return `你偏好新能源，${destName}对续航管理要求更高。${destContext.energyHint}`;
        }
        return '你偏好新能源，山路和海拔变化路线对续航管理要求更高。建议优先看增程或混动，纯电的话需要提前确认沿途充电站的覆盖情况。';
      }
      if (destContext && destContext.energyHint) {
        return `你偏好新能源，${destName}整体对新能源比较友好。${destContext.energyHint}`;
      }
      return '你偏好新能源，在这个目的地场景下是比较匹配的。重点关注车辆续航、住宿地充电条件和还车电量要求即可。';
    case 'oil':
      if (dest === 'grassland-gobi' || dest === 'grassland-long' || dest === 'loop-long' || dest === 'mountain-plateau' || dest === 'yunnan-mountain') {
        if (destName) {
          return `你偏好油车优先，在${destName}这条路上这个思路很务实——油车或混动的补能确定性最高，把精力留给风景而不是充电规划。`;
        }
        return '你偏好油车优先，在这类路线上这个思路很务实——油车或混动的补能确定性最高，把精力留给风景而不是充电规划。';
      }
      return '你偏好油车优先，建议优先看保有量大、维修网络完善的车型。油车或混动在这个场景下是最不用操心的选择。';
    case 'hybrid':
      return '你偏好混动或增程，这个选择适合大多数自驾路线：有新能源的静谧和低能耗，也保留加油补能的容错率。';
    default:
      return null;
  }
}

/* —— 第七步：不太建议的车型方向 —— */

function buildNotRecommended(profile, form, destContext) {
  const items = [];
  const dest = form.destinationType;
  const destName = getDestinationTypeLabel(dest);

  if (['mountain-plateau', 'yunnan-mountain', 'grassland-gobi', 'grassland-long', 'loop-long'].includes(dest)) {
    if (profile.size === 'compact' || profile.size === 'compact-mid') {
      items.push(dest === 'mountain-plateau'
        ? `低底盘轿车跑${destName || '山路'} — 通过性不足，遇到非铺装路面或陡坡会比较吃力`
        : `低底盘轿车跑${destName || '长距离'} — 非铺装路面和烂路的通过性不够，长途舒适性也有限`);
    }
  }

  if (dest === 'grassland-long' || dest === 'loop-long') {
    items.push(`纯电车型（非增程）— ${destName ? `${destName}偏远路段` : '偏远路段'}的充电站覆盖还不能完全放心，补能便利性需要出发前仔细确认`);
  }

  if (dest === 'mountain-plateau') {
    items.push(`小排量自然吸气车型 — ${destName ? `${destName}高海拔含氧量低` : '高海拔含氧量低'}，动力衰减会比平原明显，超车和爬坡时可能不够从容`);
  }

  if (dest === 'yunnan-mountain') {
    items.push(`只看最低价小轿车 — ${destName || '云贵山地'}山路和海拔变化会放大动力、隔音和座椅支撑的短板`);
  }

  if (form.peopleCount === '6+' && !profile.category.includes('MPV')) {
    items.push('5 座 SUV 硬塞 6 人 — 不光坐着不舒服，也不合规，建议直接看 MPV');
  }

  if (form.peopleCount === '5' && (profile.size === 'compact' || profile.size === 'compact-mid')) {
    items.push('紧凑型 SUV 坐 5 人 — 后排中间位置长途会比较难受，后备箱也可能塞不下所有人的行李');
  }

  return items;
}

/* —— 第八步：新能源适配评分 —— */

function calculateEvScore(form) {
  let score = 100;

  // 目的地类型
  if (form.destinationType === 'mountain-plateau') score -= 25;
  if (form.destinationType === 'yunnan-mountain') score -= 15;
  if (form.destinationType === 'grassland-gobi') score -= 25;
  if (form.destinationType === 'grassland-long') score -= 20;
  if (form.destinationType === 'loop-long') score -= 25;
  if (form.destinationType === 'island-leisure') score += 15;
  if (form.destinationType === 'city-short') score += 10;

  // 行李
  if (form.luggage === 'heavy') score -= 10;

  // 人数
  if (form.peopleCount === '5' || form.peopleCount === '6+') score -= 10;

  // 能源偏好
  if (form.energyPreference === 'oil') score -= 15;
  if (form.energyPreference === 'ev') score += 15;
  if (form.energyPreference === 'hybrid') score += 5;

  return Math.max(0, Math.min(100, score));
}

function getEvLevel(score) {
  if (score >= 80) {
    return {
      level: '适合新能源',
      score,
      badge: 'bg-mint text-pine',
      summary: '纯电或增程都可以重点考虑。',
      detail: '这个行程的路线条件、补能便利性和用车需求整体对新能源比较友好。可以重点关注车辆的标称续航、还车电量要求，以及每晚住宿地是否方便充电。如果沿途快充站覆盖较好，纯电体验会很不错。',
      choices: [
        { type: '纯电', weight: '推荐', desc: '适合短途、城市周边、海岛轻松游或补能条件明确的路线。提前确认住宿地充电条件和沿途快充站分布即可。' },
        { type: '增程 / 混动', weight: '可选', desc: '如果想体验新能源又不想完全依赖充电，增程是兼顾两边的稳妥选择。' },
        { type: '油车', weight: '可选', desc: '稳妥省心，适合不想额外规划补能的出行。但如果充电条件确认没问题，纯电的体验和成本更优。' },
      ],
    };
  }

  if (score >= 60) {
    return {
      level: '可以选择新能源，但建议提前规划',
      score,
      badge: 'bg-aquaCard text-pine',
      summary: '新能源可以纳入选择，但建议提前确认补能条件。',
      detail: '这个行程整体对新能源有一定友好度，但存在一两个需要留意的因素（比如路线距离、人数行李对续航的影响、或部分路段充电设施覆盖不确定）。建议出发前确认酒店、景区或目的地周边的充电站分布，如果能锁定可靠的补能点，新能源仍然是不错的选择。',
      choices: [
        { type: '增程 / 混动', weight: '推荐', desc: '适合想体验新能源，但又担心长途补能压力的路线。加油补能 + 电驱静谧，容错率最高。' },
        { type: '纯电', weight: '可选', desc: '前提是提前规划好沿途补能点，确认酒店有充电条件或附近有快充站。' },
        { type: '油车', weight: '可选', desc: '稳妥省心，适合不想花时间做补能规划的出行。' },
      ],
    };
  }

  if (score >= 40) {
    return {
      level: '纯电谨慎，增程 / 混动更稳',
      score,
      badge: 'bg-amberSoft/45 text-amberDark',
      summary: '这类行程对续航和补能容错率要求更高。',
      detail: '这个行程在路线距离、路况或补能便利性上存在一些对纯电不太友好的因素。如果不想为充电操心，建议优先考虑油车、混动或增程。如果确实想选新能源，增程是更稳妥的方向——既有电驱的静谧和低成本，又不需要完全依赖充电网络。',
      choices: [
        { type: '油车', weight: '推荐', desc: '稳妥省心，适合长途和补能不确定的路线，加油站覆盖率高、补能速度快。' },
        { type: '增程 / 混动', weight: '推荐', desc: '兼顾电驱体验和加油补能的便利，是长途路线上新能源爱好者的折中选择。' },
        { type: '纯电', weight: '谨慎', desc: '建议有一定新能源自驾经验、愿意提前详细规划补能路线的用户考虑。新手或第一次走这条路线建议暂缓。' },
      ],
    };
  }

  return {
    level: '不建议新手盲选纯电',
    score,
    badge: 'bg-coral/10 text-coral',
    summary: '这类路线距离、路况或补能不确定性更高。',
    detail: '这个行程的多项因素（路线类型、距离、补能条件等）对纯电车型的挑战较大。新手或第一次自驾这条路线，建议优先选择油车、混动或增程，把精力留给风景和体验，而不是充电规划。如果你有丰富的新能源长途经验，且愿意提前做详细的补能功课，纯电也不是完全不可行——只是容错率会明显低一些。',
    choices: [
      { type: '油车', weight: '首选', desc: '稳妥省心，适合长途和补能不确定的路线，不需要为加油之外的补能操心。' },
      { type: '增程 / 混动', weight: '推荐', desc: '如果你想兼顾电驱体验和补能便利，增程是这个行程下新能源方向的最稳妥选择。' },
      { type: '纯电', weight: '需充分准备', desc: '建议有丰富长途新能源经验、愿意提前做详细补能规划的用户考虑。务必确认沿途每一段都有可靠的充电备份方案。' },
    ],
  };
}

/* ========================================================================
   主页面
   ======================================================================== */

const emptyForm = {
  destinationType: '',
  peopleCount: '',
  luggage: '',
  energyPreference: '',
  drivingProficiency: '',
};
const CAR_RECOMMEND_CONTEXT_KEY = 'rentalDrive.carRecommendationContext';

export default function CarRecommendPage() {
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState('');

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setResult(null);
    setFeedback('');
  };

  const canGenerate = form.destinationType && form.peopleCount && form.luggage && form.energyPreference && form.drivingProficiency;

  const handleGenerate = () => {
    if (!canGenerate) {
      setFeedback('还有选项没选完，补充完整后建议会更准确。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFeedback('');
    const nextResult = generateRecommendation(form);
    setResult(nextResult);
    saveCarRecommendationContext(form, nextResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm(emptyForm);
    setResult(null);
    setFeedback('');
    try {
      localStorage.removeItem(CAR_RECOMMEND_CONTEXT_KEY);
    } catch { /* ignore */ }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-cream">
      <TopBar title="目的地车型推荐" />

      <section className="safe-bottom-action px-4 pt-4">
        {feedback ? (
          <p className="mt-3 rounded-2xl bg-amberSoft/45 px-3 py-2 text-xs font-bold leading-relaxed text-amberDark" role="status">
            {feedback}
          </p>
        ) : null}

        {result ? (
          <div className="mt-4 grid gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-aquaCard px-4 text-sm font-bold text-pine"
            >
              重新填写
            </button>
            <ResultView result={result} form={form} />
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <OptionField
              label="目的地类型"
              icon={Compass}
              options={destinationTypeOptions}
              value={form.destinationType}
              onChange={(v) => update('destinationType', v)}
              cols="full"
            />

            <OptionField
              label="出行人数"
              icon={Users}
              options={peopleOptions}
              value={form.peopleCount}
              onChange={(v) => update('peopleCount', v)}
            />

            <OptionField
              label="行李情况"
              icon={Luggage}
              options={luggageOptions}
              value={form.luggage}
              onChange={(v) => update('luggage', v)}
              cols="full"
            />

            <OptionField
              label="能源类型偏好"
              icon={BatteryCharging}
              options={energyPreferenceOptions}
              value={form.energyPreference}
              onChange={(v) => update('energyPreference', v)}
            />

            <OptionField
              label="驾驶熟练度"
              icon={UserCheck}
              options={drivingProficiencyOptions}
              value={form.drivingProficiency}
              onChange={(v) => update('drivingProficiency', v)}
              cols="full"
            />

            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#174B63] to-[#1E6B8A] px-4 text-sm font-bold text-white shadow-lg shadow-pine/20 active:scale-[0.99]"
            >
              <Sparkles size={18} />
              生成车型建议
            </button>
          </div>
        )}
      </section>

      {!result ? (
        <BottomActionBar>
          <BottomActionButton as={Link} to="/price-compare">
            去对比租车方案
            <ArrowRight size={17} />
          </BottomActionButton>
        </BottomActionBar>
      ) : null}
    </main>
  );
}

function saveCarRecommendationContext(form, result) {
  try {
    localStorage.setItem(CAR_RECOMMEND_CONTEXT_KEY, JSON.stringify({
      destinationType: form.destinationType || '',
      destinationLabel: result?.tripProfile?.type || getDestinationTypeLabel(form.destinationType),
      destination: result?.derivedDest || result?.tripProfile?.destination || '',
      peopleCount: form.peopleCount || '',
      luggage: form.luggage || '',
      energyPreference: form.energyPreference || '',
      drivingProficiency: form.drivingProficiency || '',
      savedAt: Date.now(),
    }));
  } catch { /* ignore */ }
}

/* ========================================================================
   表单子组件
   ======================================================================== */

function FormField({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink">
        {Icon ? <Icon size={16} className="text-pine" /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function OptionField({ label, icon: Icon, options, value, onChange, cols }) {
  return (
    <fieldset className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <legend className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
        {Icon ? <Icon size={16} className="text-pine" /> : null}
        {label}
      </legend>
      <div className={`grid gap-2 ${cols === 'full' ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {options.map((opt) => {
          const active = value === opt.value;
          const OptIcon = opt.icon;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(active ? '' : opt.value)}
              className={`flex min-h-[58px] items-center gap-2 rounded-[16px] px-3 py-2.5 text-left transition active:scale-[0.98] ${
                active
                  ? 'bg-pine text-white shadow-sm shadow-pine/15'
                  : 'bg-aquaCard text-muted hover:bg-mint hover:text-ink'
              }`}
            >
              {OptIcon ? <OptIcon size={16} className="shrink-0" /> : null}
              <span className="min-w-0">
                <span className="block break-words text-sm font-bold leading-snug">{opt.label}</span>
                {opt.hint ? (
                  <span className={`mt-0.5 block break-words text-[11px] font-medium leading-snug ${active ? 'text-white/75' : 'text-muted/80'}`}>
                    {opt.hint}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function buildResultCopyText(result, form, insuranceAdvice, insuranceSuggestions) {
  const tieredVehicles = getTieredVehicleRecommendations(result.derivedDest || '', {
    peopleCount: form.peopleCount,
    luggageLevel: form.luggage,
    energyPreference: form.energyPreference,
    drivingPreference: form.drivingProficiency,
  });
  const lines = [
    '【我的车型建议】',
    `目的地类型：${result.tripProfile.type}`,
    `出行人数：${result.tripProfile.people}`,
    `行李：${result.tripProfile.luggage}`,
    `能源偏好：${result.tripProfile.energyPreference}`,
    `驾驶熟练度：${result.tripProfile.drivingProficiency}`,
    '',
    `优先方向：${result.primary.category}`,
    `参考车型：${result.primary.models}`,
    `新能源适配：${result.evScore.level}`,
    '',
  ].filter(Boolean);

  if (result.reasons.length) {
    lines.push('推荐理由：');
    result.reasons.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push('');
  }

  if (tieredVehicles.length) {
    lines.push('三档车型参考：');
    tieredVehicles.forEach((v) => {
      lines.push(`- ${v.priceTierLabel || '推荐方案'}：${getVehicleName(v)}（${getVehicleTags(v, form, result.destContext).join(' / ')}，${getFitLabel(v)}）`);
    });
    lines.push('');
  }

  if (result.notRecommended.length) {
    lines.push('不太建议：');
    result.notRecommended.forEach((r) => lines.push(`- ${r}`));
    lines.push('');
  }

  // 保险建议
  if (insuranceAdvice?.matched && insuranceSuggestions) {
    lines.push('【保险建议】');
    lines.push(`建议优先关注${insuranceSuggestions.tierLabel}`);
    lines.push(insuranceSuggestions.reason);
    lines.push(`重点核对：${insuranceSuggestions.priorityTagsDisplay}`);
    if (insuranceSuggestions.byPlatform && Object.keys(insuranceSuggestions.byPlatform).length > 0) {
      lines.push('可优先核对的方案：');
      Object.entries(insuranceSuggestions.byPlatform).forEach(([, info]) => {
        lines.push(`  ${info.platformName}: ${info.planNames.join('、')}`);
      });
    }
    lines.push('');
  }

  lines.push('当前为免费轻量建议，主要帮你判断车型和能源大方向。具体车型、平台价格和补能路线，建议结合实际车源再确认。');
  lines.push(INSURANCE_DISCLAIMER);
  lines.push('来自 pYuY 租车自驾工具箱。');
  return lines.join('\n');
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function getVehicleName(vehicle) {
  return vehicle?.name || `${vehicle?.brand || ''}${vehicle?.model || ''}`.trim() || '推荐车型';
}

function compactText(text, maxLength = 76) {
  const cleaned = String(text || '').replace(/\s+/g, '').replace(/；{2,}/g, '；');
  if (!cleaned) return '';
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1)}…` : cleaned;
}

function getVehicleTypeTag(vehicle) {
  const type = vehicle?.bodyType || vehicle?.carType || '';
  const level = vehicle?.vehicleLevel || '';
  if (type && level && !type.includes(level) && !level.includes(type)) return `${level}${type}`;
  return type || level || '';
}

function getEnergyTag(energyType) {
  const map = {
    汽油: '油车',
    油电混动: '混动',
    插电混动: '插混',
    增程式: '增程',
    纯电动: '纯电',
  };
  return map[energyType] || energyType || '';
}

function getDestinationFitTag(form, destContext) {
  if (form.destinationType === 'city-short') return '城市友好';
  if (form.destinationType === 'island-leisure') return '滨海适合';
  if (['mountain-plateau', 'yunnan-mountain'].includes(form.destinationType)) return '山路适配';
  if (['grassland-gobi', 'grassland-long', 'loop-long'].includes(form.destinationType)) return '长途适合';
  return destContext?.altitudeRisk === '高' ? '复杂路况适合' : '路线适配';
}

function getFitLabel(vehicle) {
  const score = Number(vehicle?.recommendationScore ?? vehicle?.overallScore ?? 0);
  if (vehicle?.recommendationLevel === '强烈推荐' || score >= 4.35) return '适配度较高';
  if (score >= 3.85) return '适配度中等偏高';
  if (vehicle?.recommendationLevel === '谨慎选择') return '需要确认车况';
  return '适配度中等';
}

function parseHorsepowerText(value) {
  const nums = String(value || '').match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number).filter(Number.isFinite));
}

function getPowerDisplay(vehicle, form, detail = false) {
  const hp = parseHorsepowerText(vehicle?.horsepower);
  const label = vehicle?.powerReserveLabel || '';
  const complexRoute = ['mountain-plateau', 'yunnan-mountain', 'grassland-gobi', 'grassland-long', 'loop-long'].includes(form.destinationType);
  const loaded = ['5', '6+'].includes(form.peopleCount) || form.luggage === 'heavy';

  if (!label && !hp) return '';
  if (detail) {
    if (complexRoute && hp >= 220) return `动力储备更适合山路、长途或满载场景，参考马力：${hp} Ps。`;
    if (loaded && hp >= 180) return `多人或行李较多时动力更从容，参考马力：${hp} Ps。`;
    if (form.destinationType === 'city-short') return hp ? `城市短途不必只看高马力，这台车的动力日常够用，参考马力：${hp} Ps。` : '城市短途更看重好开好停，动力不是唯一重点。';
    return hp ? `动力表现以日常自驾够用为主，参考马力：${hp} Ps。` : label;
  }

  if (complexRoute && label === '动力更充足') return '动力充足';
  if (loaded && hp >= 180) return '满载更从容';
  if (complexRoute && label) return label;
  return '';
}

function getVehicleTags(vehicle, form, destContext) {
  const tags = [
    getVehicleTypeTag(vehicle),
    getEnergyTag(vehicle?.energyType),
    getDestinationFitTag(form, destContext),
  ];

  const powerTag = getPowerDisplay(vehicle, form);
  if (powerTag) tags.push(powerTag);
  if ((form.drivingProficiency === 'beginner' || vehicle?.beginnerFriendlyScore >= 4) && tags.length < 4) tags.push('新手友好');
  if ((vehicle?.spaceScore >= 4 || vehicle?.luggageCapacity === '好' || vehicle?.trunkSpace === '好') && tags.length < 4) tags.push('空间够用');
  if ((vehicle?.comfortScore >= 4 || vehicle?.longDistanceComfort === '好') && tags.length < 4) tags.push('长途舒服');

  return [...new Set(tags.filter(Boolean))].slice(0, 4);
}

function buildVehicleShortReason(vehicle, form, destContext) {
  const source = vehicle?.reason || vehicle?.summarySentence || vehicle?.bestUseCase || '';
  if (source) return compactText(source);

  const type = getVehicleTypeTag(vehicle) || '这类车';
  const fit = getDestinationFitTag(form, destContext);
  return `${type}在空间、补能和驾驶难度上比较均衡，适合这次${fit}的自驾需求。`;
}

function buildVehicleDecisionBrief(vehicle, form, tripProfile, destContext, keywords) {
  const typeTag = getVehicleTypeTag(vehicle) || '这类车';
  const energyTag = getEnergyTag(vehicle?.energyType) || '能源';
  const fitTag = getDestinationFitTag(form, destContext);
  const priceLabel = vehicle?.priceTierLabel || (vehicle?.priceTier ? `${vehicle.priceTier}价方案` : '推荐方案');
  const seats = Number(vehicle?.seatCount) || 0;
  const people = form.peopleCount === '6+' ? 6 : Number.parseInt(form.peopleCount, 10) || 0;
  const luggage = vehicle?.luggageCapacity || vehicle?.trunkSpace || '';
  const parking = vehicle?.parkingDifficulty ? `停车${vehicle.parkingDifficulty}` : '';
  const driving = vehicle?.drivingDifficulty ? `驾驶${vehicle.drivingDifficulty}` : '';
  const charge = vehicle?.refuelChargeConvenience || '';
  const power = getPowerDisplay(vehicle, form, true);

  const headline = compactText(
    vehicle?.reason
      || vehicle?.summarySentence
      || buildDestinationHeadline(typeTag, form, tripProfile, destContext),
    50,
  );

  const routeText = compactText(
    `${fitTag}。${destContext?.highlights || `${tripProfile.type}重点看路况、补能和停车压力。`}`,
    54,
  );

  const spaceParts = [
    seats ? `${seats}座` : '',
    people ? `适合${form.peopleCount}人` : '',
    luggage ? `行李${luggage}` : '',
    parking || driving,
  ].filter(Boolean);
  const spaceText = compactText(
    spaceParts.length ? spaceParts.join('，') : `${typeTag}在空间和驾驶难度上更均衡。`,
    46,
  );

  const energyParts = [
    `${energyTag} / ${priceLabel}`,
    charge,
    power,
  ].filter(Boolean);
  const energyText = compactText(
    energyParts.length ? energyParts.join('，') : '按能源、价格和补能便利性做平衡。',
    52,
  );

  const riskText = vehicle?.notSuitableCase || vehicle?.warning || '';
  const searchText = keywords?.length ? `平台可搜：${keywords.slice(0, 3).join('、')}` : '';

  return {
    headline,
    evidence: [
      { label: '路线匹配', text: routeText },
      { label: '空间/驾驶', text: spaceText },
      { label: '能源/成本', text: energyText },
    ],
    note: riskText
      ? { label: '注意', text: compactText(riskText, 54), tone: 'warning' }
      : { label: '平台可搜', text: compactText(searchText || `${getVehicleName(vehicle)} 同级`, 54), tone: 'search' },
  };
}

function buildDestinationHeadline(typeTag, form, tripProfile, destContext) {
  if (form.destinationType === 'city-short') return `适合城市短途，重点优势是好开好停和使用成本可控。`;
  if (form.destinationType === 'island-leisure') return `适合滨海轻松自驾，${typeTag}更看重舒适、颜值和补能便利。`;
  if (['mountain-plateau', 'yunnan-mountain'].includes(form.destinationType)) {
    return `适合山路高原场景，优先看动力、底盘和补能容错。`;
  }
  if (['grassland-gobi', 'grassland-long', 'loop-long'].includes(form.destinationType)) {
    return `适合长距离自驾，重点看续航余量、舒适性和可靠性。`;
  }
  return `${typeTag}适合这次${tripProfile?.type || destContext?.name || '自驾'}，整体更均衡。`;
}

/* ========================================================================
   结果展示 — 5 张手机端友好卡片
   ======================================================================== */

function ResultView({ result, form }) {
  const { tripProfile, primary, notRecommended, energyAdvice, destContext } = result;
  const [copyState, setCopyState] = useState('idle'); // idle | ok | fail

  const handleCopy = async () => {
    const text = buildResultCopyText(result, form, insuranceAdvice, insuranceSuggestions);
    const ok = await copyToClipboard(text);
    setCopyState(ok ? 'ok' : 'fail');
    setTimeout(() => setCopyState('idle'), 3000);
  };

  // 获取三档车型示例 + 生成一句话总结 + 关键词 + 不建议理由
  const derivedDest = result.derivedDest || '';
  const tieredVehicles = getTieredVehicleRecommendations(derivedDest, {
    peopleCount: form.peopleCount,
    luggageLevel: form.luggage,
    energyPreference: form.energyPreference,
    drivingPreference: form.drivingProficiency,
  });
  const topVehicles = tieredVehicles.length
    ? tieredVehicles
    : getTopVehicleExamples(derivedDest, {
      peopleCount: form.peopleCount,
      luggageLevel: form.luggage,
      energyPreference: form.energyPreference,
      drivingPreference: form.drivingProficiency,
    });
  const oneLiner = buildOneLinerSummary(destContext, result, topVehicles, form);
  const keywords = buildSearchKeywords(topVehicles);
  const whyNotAdvices = buildWhyNotAdvice(topVehicles, derivedDest, {
    peopleCount: form.peopleCount,
    destinationLabel: tripProfile.type,
  });
  const tradeOff = buildTradeOffAdvice(destContext, form);

  // 保险场景化建议
  const insuranceContext = useMemo(() => buildInsuranceContext(form, result), [form, result]);
  const insuranceAdvice = useMemo(() => getInsuranceAdviceByScenario(insuranceContext), [insuranceContext]);
  const insuranceSuggestions = useMemo(
    () => (insuranceAdvice.matched ? buildInsuranceSuggestions(insuranceAdvice) : null),
    [insuranceAdvice],
  );

  return (
    <div className="grid gap-4">
      {/* === 一句话口语总结 === */}
      {oneLiner ? (
        <section className="rounded-[20px] bg-gradient-to-r from-mint/70 via-aquaCard to-mint/40 px-4 py-3.5 shadow-sm ring-1 ring-pine/10">
          <p className="text-sm font-bold leading-relaxed text-pine">
            <span className="mr-1.5 inline-block rounded-full bg-pine/10 px-1.5 py-0.5 text-[11px] align-middle">一句话总结</span>
            {oneLiner}
          </p>
        </section>
      ) : null}

      {/* === 卡片 1：推荐方向 === */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">推荐方向</h2>
        </div>

        {/* 能源方向 */}
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-aquaCard px-3 py-2.5">
          {energyAdvice.level === 'ev-friendly' || energyAdvice.level === 'recommend-extended'
            ? <BatteryCharging size={15} className="shrink-0 text-pine" />
            : <Fuel size={15} className="shrink-0 text-amberDark" />
          }
          <p className="text-sm font-bold text-ink">{energyAdvice.recommended}</p>
        </div>

        {/* 三档车型示例 */}
        <div className="mt-3">
          <p className="text-xs font-bold text-muted">三档车型推荐</p>
          {tieredVehicles.length > 0 ? (
            <div className="mt-2 grid gap-2">
              {tieredVehicles.map((v) => (
                <div key={`${v.priceTier}-${v.vehicleId}`} className="rounded-2xl bg-aquaCard/70 px-3 py-3 ring-1 ring-pine/5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-muted">{v.priceTierLabel || '推荐方案'}</p>
                      <p className="mt-0.5 break-words text-base font-bold leading-snug text-ink">{getVehicleName(v)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-pine">
                      {getFitLabel(v)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {getVehicleTags(v, form, destContext).map((tag) => (
                      <span key={tag} className="rounded-full bg-card/80 px-2 py-0.5 text-[10px] font-bold text-pine ring-1 ring-pine/10">{tag}</span>
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-ink">{buildVehicleShortReason(v, form, destContext)}</p>
                    <VehicleDecisionDetails
                      vehicle={v}
                      form={form}
                      tripProfile={tripProfile}
                      destContext={destContext}
                      keywords={keywords}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-2xl bg-aquaCard/50 px-3 py-2.5 text-sm font-medium text-muted">
              可在租车平台按"{primary.category}"筛选更多车源。
            </p>
          )}
        </div>
      </section>

      <details className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <summary className="cursor-pointer list-none text-sm font-bold text-pine">
          展开看完整理由、搜索和保险建议
        </summary>
        <div className="mt-3 grid gap-3">
      {/* === 卡片 2：为什么适合 === */}
      <section className="rounded-[20px] bg-aquaCard/40 p-3 ring-1 ring-pine/10">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">为什么适合</h2>
        </div>
        <div className="mt-3 grid gap-2">
          <FitRow icon={<Users size={14} />} label="人数行李">
            {tripProfile.people}出行，{tripProfile.luggage}，优先看{primary.category}。
          </FitRow>
          <FitRow icon={<MapPin size={14} />} label="路线类型">
            {tripProfile.type}，按路况、距离和补能风险来匹配车型。
          </FitRow>
          <FitRow icon={<BatteryCharging size={14} />} label="能源偏好">
            {energyAdvice.recommended}。
          </FitRow>
        </div>
      </section>

      {/* === 卡片 3：能源怎么选 === */}
      <section className="rounded-[20px] bg-aquaCard/40 p-3 ring-1 ring-pine/10">
        <div className="flex items-center gap-2">
          <BatteryCharging size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">能源怎么选</h2>
        </div>
        <div className="mt-3 grid gap-2.5">
          <EnergyRow
            label="油车"
            tag={energyAdvice.level === 'recommend-oil-strong' || energyAdvice.level === 'recommend-oil' ? '推荐' : '可选'}
            tagTone={energyAdvice.level === 'recommend-oil-strong' || energyAdvice.level === 'recommend-oil' ? 'primary' : 'neutral'}
          >
            最稳，适合补能不确定的路线，加油站覆盖率高、补能速度快。
          </EnergyRow>
          <EnergyRow
            label="插混 / 增程"
            tag={energyAdvice.level === 'recommend-extended' ? '推荐' : '可选'}
            tagTone={energyAdvice.level === 'recommend-extended' ? 'primary' : 'neutral'}
          >
            兼顾电驱静谧和加油补能的便利，长途路线的稳妥折中。
          </EnergyRow>
          <EnergyRow
            label="纯电"
            tag={energyAdvice.level === 'ev-friendly' ? '适合' : energyAdvice.level === 'recommend-oil-strong' ? '需充分准备' : '谨慎'}
            tagTone={energyAdvice.level === 'ev-friendly' ? 'primary' : 'cautious'}
          >
            补能便利的路线使用成本低、体验好；长途、高原或偏远路线需提前确认沿途充电站。
          </EnergyRow>
        </div>
        <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
          以上为经验参考，建议结合实际车源和当地充电站分布判断。
        </p>
      </section>

      {/* === 卡片 4：去平台怎么搜 === */}
      <section className="rounded-[20px] bg-aquaCard/40 p-3 ring-1 ring-pine/10">
        <div className="flex items-center gap-2">
          <ArrowRight size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">去平台上可以这样搜</h2>
        </div>

        {/* 搜索关键词标签 */}
        {keywords.length > 0 ? (
          <div className="mt-3">
            <p className="text-xs font-bold text-muted">搜索关键词</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <span key={kw} className="rounded-full bg-aquaCard px-2.5 py-1 text-xs font-bold text-pine ring-1 ring-pine/10">{kw}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-xs font-bold text-muted">搜索关键词</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-aquaCard px-2.5 py-1 text-xs font-bold text-pine ring-1 ring-pine/10">{primary.category}</span>
              <span className="rounded-full bg-aquaCard px-2.5 py-1 text-xs font-bold text-pine ring-1 ring-pine/10">自动挡</span>
            </div>
          </div>
        )}

        {/* 同级车型参考 */}
        <div className="mt-3">
          <p className="text-xs font-bold text-muted">可重点看的同级车型</p>
          {topVehicles.length > 0 ? (
            <div className="mt-2 grid gap-1.5">
              {topVehicles.slice(0, 4).map((v) => (
                <div key={v.vehicleId} className="flex items-center justify-between rounded-xl bg-aquaCard/50 px-3 py-2">
                  <span className="text-sm font-bold text-ink">{(v.brand || '') + (v.model || '')} 同级</span>
                  <span className="text-xs font-medium text-muted">{v.vehicleLevel || ''} {v.energyType ? '· ' + v.energyType : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-2xl bg-aquaCard/50 px-3 py-2.5 text-sm font-medium text-muted">
              可在平台按"{primary.category}"筛选，再对比车型级别和能源类型。
            </p>
          )}
        </div>

        {/* 平台筛选建议 */}
        <div className="mt-3 rounded-2xl bg-aquaCard/50 px-3 py-2.5">
          <p className="text-xs font-bold text-muted">平台筛选建议</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-ink">
            在神州租车、一嗨租车、哈啰租车、携程租车等平台搜索以上关键词，再按取车城市、车型级别、保险方案和日租价排序筛选。
          </p>
        </div>

        {/* 价格提醒 */}
        <p className="mt-2.5 rounded-2xl bg-mint/50 px-3 py-2 text-xs font-medium leading-relaxed text-pine">
          价格以平台实时显示为准，旺季建议提前 3-7 天看车源、对比 2-3 个平台再下单。
        </p>

      </section>

      {/* === 卡片 5：为什么不建议这样选 === */}
      <section className="rounded-[20px] bg-aquaCard/40 p-3 ring-1 ring-pine/10">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-amberDark" />
          <h2 className="text-lg font-bold text-ink">{tradeOff ? tradeOff.title : '不建议什么'}</h2>
        </div>

        {/* A. 权衡解释（条件化动态模块） */}
        {tradeOff ? (
          <div className="mt-3 rounded-2xl bg-gradient-to-r from-amberSoft/30 to-mint/30 px-4 py-3 ring-1 ring-amberSoft/40">
            <p className="text-sm font-bold leading-relaxed text-ink">{tradeOff.body}</p>
          </div>
        ) : null}

        {/* B. 不推荐的车型/能源方向 */}
        {notRecommended.length > 0 ? (
          <div className="mt-3 grid gap-1.5">
            <p className="text-xs font-bold text-muted">具体不建议的方向</p>
            {notRecommended.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-xl bg-coral/5 px-3 py-2.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-coral" />
                <span className="text-sm font-medium text-ink">{item}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* C. 补充解释 */}
        {whyNotAdvices.length > 0 ? (
          <div className="mt-2.5 grid gap-1.5">
            {whyNotAdvices.map((advice, i) => (
              <div key={i} className="rounded-xl bg-aquaCard/50 px-3 py-2.5">
                <p className="text-xs font-medium leading-relaxed text-ink">{advice}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* === 卡片 6：保险怎么选 === */}
      <InsuranceAdviceCard
        advice={insuranceAdvice}
        suggestions={insuranceSuggestions}
        destContext={destContext}
        compact
      />
        </div>
      </details>

      {/* === 底部操作 === */}
      <section className="rounded-[24px] border border-pine/10 bg-aquaCard p-4 shadow-card">
        <div className="grid gap-2.5">
          <Link
            to="/price-compare"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#174B63] to-[#1E6B8A] px-4 text-sm font-bold text-white shadow-lg shadow-pine/20"
          >
            对比租车方案
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/budget"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-card px-4 text-sm font-bold text-pine ring-1 ring-pine/15"
          >
            去算这趟预算
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            disabled={copyState !== 'idle'}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-card px-4 text-sm font-bold text-pine ring-1 ring-pine/15 disabled:opacity-70"
          >
            {copyState === 'ok' ? '已复制' : copyState === 'fail' ? '复制失败，可截图保存' : '保存这份建议'}
            <Copy size={16} />
          </button>
        </div>
        {copyState === 'ok' ? (
          <p className="mt-2 text-center text-xs font-bold text-pine">已复制，也可以截图保存</p>
        ) : null}
      </section>

      {/* 轻量说明 */}
      <div className="rounded-2xl bg-mint/50 px-4 py-3 text-center ring-1 ring-pine/10">
        <p className="text-xs font-bold leading-relaxed text-pine">
          当前为免费轻量建议，主要帮你判断低价、中价、高价三档车型方向。
        </p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-muted">
          具体日租价、保险和补能路线，建议结合实际车源再确认。
        </p>
      </div>
    </div>
  );
}

function VehicleDecisionDetails({ vehicle, form, tripProfile, destContext, keywords }) {
  const brief = buildVehicleDecisionBrief(vehicle, form, tripProfile, destContext, keywords);
  const noteClass = brief.note.tone === 'warning'
    ? 'bg-coral/5 text-coral ring-coral/10'
    : 'bg-mint/45 text-pine ring-pine/10';

  return (
    <details className="group mt-2 rounded-xl bg-card/60 px-3 py-2 ring-1 ring-pine/10">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-bold text-pine">
        <span>展开看选择依据</span>
        <span className="text-[10px] font-medium text-muted group-open:hidden">3点速览</span>
        <span className="hidden text-[10px] font-medium text-muted group-open:inline">收起</span>
      </summary>

      <div className="mt-2 grid gap-2">
        <div className="rounded-xl bg-mint/40 px-3 py-2 ring-1 ring-pine/10">
          <p className="text-xs font-bold leading-relaxed text-pine">{brief.headline}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {brief.evidence.map((item) => (
            <div key={item.label} className="min-w-0 rounded-xl bg-aquaCard/55 px-2.5 py-2 ring-1 ring-pine/5">
              <p className="text-[10px] font-bold text-muted">{item.label}</p>
              <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-ink">{item.text}</p>
            </div>
          ))}
        </div>

        {brief.note.text ? (
          <div className={`rounded-xl px-3 py-2 text-xs font-medium leading-snug ring-1 ${noteClass}`}>
            <span className="mr-1 font-bold">{brief.note.label}</span>
            {brief.note.text}
          </div>
        ) : null}
      </div>
    </details>
  );
}

function FitRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-aquaCard/50 px-3 py-2.5">
      <span className="mt-0.5 shrink-0 text-pine">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium leading-relaxed text-ink">{children}</p>
      </div>
    </div>
  );
}

function EnergyRow({ label, tag, tagTone, children }) {
  const tagClass = tagTone === 'primary'
    ? 'bg-pine text-white'
    : tagTone === 'cautious'
      ? 'bg-coral/10 text-coral'
      : 'bg-aquaCard text-pine ring-1 ring-pine/10';

  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-aquaCard/50 px-3 py-2.5">
      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tagClass}`}>{tag}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">{children}</p>
      </div>
    </div>
  );
}

/* ========================================================================
   保险建议 — 上下文构建 & 方案推荐
   ======================================================================== */

/** 从用户表单和推荐结果中构建保险建议上下文 */
function buildInsuranceContext(form, result) {
  return {
    destination: result?.tripProfile?.destination || '',
    destinationType: form.destinationType || '',
    peopleCount: form.peopleCount || form.people || '',
    people: form.peopleCount || form.people || '',
    tripDays: result?.tripProfile ? form.tripDays : '',
    preference: form.energyPreference || '',
    isBeginner: form.drivingProficiency === 'beginner',
    experience: form.drivingProficiency || '',
    budgetConscious: false,
  };
}

function buildOptimizedPrimaryProfile(fallbackProfile, vehicles) {
  if (!vehicles.length) return fallbackProfile;

  const bodyTypes = [...new Set(vehicles.map((v) => v.bodyType || v.carType).filter(Boolean))].slice(0, 2);
  const levels = [...new Set(vehicles.map((v) => v.vehicleLevel).filter(Boolean))].slice(0, 2);
  const models = vehicles.map((v) => `${v.brand || ''}${v.model || ''}`.trim()).filter(Boolean).slice(0, 4);
  const energyTypes = [...new Set(vehicles.map((v) => v.energyType).filter(Boolean))].slice(0, 2);

  return {
    ...fallbackProfile,
    category: [levels.join('/'), bodyTypes.join('/')].filter(Boolean).join(' ') || fallbackProfile.category,
    models: models.join('、') || fallbackProfile.models,
    energyAdvice: {
      ...fallbackProfile.energyAdvice,
      recommended: energyTypes.length ? energyTypes.join(' / ') : fallbackProfile.energyAdvice?.recommended,
    },
  };
}

/** 根据匹配到的场景规则，从 INSURANCE_PLANS 中查找对应平台/方案名称 */
function buildInsuranceSuggestions(insuranceAdvice) {
  if (!insuranceAdvice || !insuranceAdvice.matched) return null;

  const { advices, suggestedTier } = insuranceAdvice;
  const primaryRule = advices[0];
  if (!primaryRule) return null;

  // 收集所有高保障/中等保障方案中匹配优先标签的方案
  const allPlatforms = ['ctrip', '1hai', 'shenzhou'];
  const byPlatform = {};

  allPlatforms.forEach((pid) => {
    const result = getPlatformInsurancePlans(pid);
    if (!result) return;

    const { platform, plans } = result;

    // 优先选匹配建议等级的方案
    let matchedPlans = plans.filter((p) => p.tier === suggestedTier || p.tier === 'premium');

    // 如果不够，补充中等保障方案
    if (matchedPlans.length < 2) {
      matchedPlans = plans.filter((p) => p.tier === suggestedTier || p.tier === 'premium' || p.tier === 'standard');
    }

    if (matchedPlans.length) {
      byPlatform[pid] = {
        platformName: platform.name,
        planNames: matchedPlans.slice(0, 3).map((p) => p.name),
      };
    }
  });

  return {
    tierLabel: suggestedTier === 'premium' ? '高保障' : suggestedTier === 'standard' ? '中等保障' : '基础保障',
    priorityTagsDisplay: primaryRule.priorityTags
      .map((tag) => {
        const map = {
          tireWheel: '轮胎/轮毂',
          thirdParty: '三者额度',
          vehicleDamage: '车损自付',
          driverPassenger: '司乘保障',
          downtime: '停运费',
          depreciation: '折旧费',
          advancePayment: '费用垫付',
          glass: '玻璃破损',
          medicalOutsideInsurance: '医保外费用',
        };
        return map[tag] || tag;
      })
      .join('、'),
    reason: primaryRule.reason,
    riskTags: primaryRule.riskTags || [],
    byPlatform,
  };
}

function InsuranceAdviceCard({ advice, suggestions, destContext, compact = false }) {
  if (!advice) return null;

  return (
    <section className={compact ? 'rounded-[20px] bg-aquaCard/40 p-3 ring-1 ring-pine/10' : 'rounded-[24px] border border-pine/10 bg-card p-4 shadow-card'}>
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-pine" />
        <h2 className="text-lg font-bold text-ink">保险怎么选</h2>
      </div>

      {advice.matched && suggestions ? (
        <>
          {/* 场景化建议 */}
          <div className="mt-3 rounded-2xl bg-gradient-to-r from-mint/70 to-mint/30 px-4 py-3 ring-1 ring-pine/10">
            <p className="text-[11px] font-bold text-muted">
              根据你的路线，建议优先关注{suggestions.tierLabel}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-ink">
              {suggestions.reason}
            </p>
          </div>

          {/* 建议重点关注的保障维度 */}
          <div className="mt-2.5 rounded-2xl bg-aquaCard/60 px-3 py-2.5">
            <p className="text-[11px] font-bold text-muted">重点核对</p>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-ink">
              {suggestions.priorityTagsDisplay}
            </p>
          </div>

          {/* 风险提示 */}
          {suggestions.riskTags.length > 0 ? (
            <div className="mt-2 grid gap-1">
              {suggestions.riskTags.slice(0, 2).map((tag, i) => (
                <div key={i} className="flex items-start gap-1.5 rounded-xl bg-amberSoft/25 px-2.5 py-2">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amberDark" />
                  <p className="text-[11px] leading-relaxed text-ink">{tag}</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* 可参考的平台方案 */}
          {suggestions.byPlatform && Object.keys(suggestions.byPlatform).length > 0 ? (
            <div className="mt-2.5 rounded-2xl bg-aquaCard/40 px-3 py-2.5">
              <p className="text-[11px] font-bold text-muted">可优先核对的方案</p>
              <div className="mt-1.5 grid gap-1.5">
                {Object.entries(suggestions.byPlatform).map(([pid, info]) => (
                  <div key={pid} className="flex items-baseline gap-1.5 text-xs leading-relaxed">
                    <span className="shrink-0 font-bold text-pine">{info.platformName}</span>
                    <span className="text-muted">{info.planNames.join('、')}</span>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] font-medium leading-relaxed text-muted/70">
                方案名称和保障内容可能随平台调整，实际以下单页为准
              </p>
            </div>
          ) : null}

          {/* 新手特别提示 */}
          {advice.advices.some((a) => a.ruleId === 'beginner') ? (
            <div className="mt-2 rounded-xl bg-mint/50 px-3 py-2">
              <p className="text-xs font-bold text-pine">新手小贴士</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink">
                即使买了高保障，取车时仍要拍清楚外观、轮胎、轮毂、玻璃、内饰和仪表盘。出发前可以去「车身验车避坑图」先看一遍重点位置。
              </p>
            </div>
          ) : null}
        </>
      ) : (
        /* 兜底：未匹配到特定场景规则时，给通用建议 */
        <div className="mt-3 grid gap-2.5">
          <div className="rounded-2xl bg-aquaCard/60 px-3 py-3">
            <p className="text-sm font-medium leading-relaxed text-ink">
              不同路线和出行方式对保险保障的要求不同。一般建议至少核对车损自付额、三者额度、轮胎轮毂和停运费。长途、山路或多人出行建议往高保障靠。
            </p>
          </div>
          <div className="rounded-2xl bg-mint/50 px-3 py-2.5">
            <p className="text-xs font-medium leading-relaxed text-pine">
              去「比租车方案」页面，把不同平台的保险方案放在一起对比，会更清楚。
            </p>
          </div>
        </div>
      )}

      <p className="mt-3 text-[10px] font-medium leading-relaxed text-muted/70">
        {INSURANCE_DISCLAIMER}
      </p>
    </section>
  );
}
