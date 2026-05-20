import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  CarFront,
  Compass,
  Copy,
  Fuel,
  Info,
  Luggage,
  MapPin,
  Mountain,
  ShieldCheck,
  Ship,
  Sparkles,
  UserCheck,
  Users,
  Waves,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import TopBar from '../components/TopBar.jsx';
import { findDestinationProfile, buildDestinationContext, getTopVehicleExamples, buildOneLinerSummary, buildSearchKeywords, buildWhyNotAdvice, buildTradeOffAdvice, buildDataNotice } from '../utils/carRecommendationDataHelpers.js';
import { getInsuranceAdviceByScenario, getPlatformInsurancePlans, INSURANCE_DISCLAIMER } from '../utils/insuranceUtils.js';

/* ========================================================================
   表单选项定义
   ======================================================================== */

const destinationTypeOptions = [
  { value: 'city-short', label: '城市周边短途', icon: MapPin },
  { value: 'island-leisure', label: '海岛 / 城市轻松游', icon: Waves },
  { value: 'mountain-plateau', label: '山路 / 高原自驾', icon: Mountain },
  { value: 'grassland-long', label: '长距离草原 / 新疆', icon: Ship },
  { value: 'loop-long', label: '大环线 / 跨城长途', icon: Compass },
  { value: 'unsure', label: '不确定，让系统给建议', icon: Info },
];

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

const intensityOptions = [
  { value: 'easy', label: '轻松：每天开车不多' },
  { value: 'medium', label: '中等：每天有一定距离' },
  { value: 'high', label: '较高：跨城 / 环线 / 每天开车较久' },
];

const preferenceOptions = [
  { value: 'budget', label: '省钱优先' },
  { value: 'comfort', label: '舒适优先' },
  { value: 'photo', label: '拍照 / 体验优先' },
  { value: 'ev', label: '新能源优先' },
  { value: 'reliable', label: '不想操心，稳定优先' },
];

/* ========================================================================
   推荐引擎
   ======================================================================== */

function generateRecommendation(form) {
  const profile = buildProfile(form);
  const destAdjust = applyDestination(form.destinationType, profile);
  const intensityResult = applyIntensity(form.tripIntensity, destAdjust);
  const prefResult = applyPreference(form.preference, intensityResult);

  // 尝试从 JSON 数据中匹配用户输入的目的地
  const destProfile = findDestinationProfile(form.destination);
  const destContext = destProfile ? buildDestinationContext(form.destination) : null;

  const directions = buildDirections(prefResult, form);
  const reasons = buildReasons(prefResult, form, destContext);
  const notRecommended = buildNotRecommended(prefResult, form, destContext);
  const evScore = calculateEvScore(form);
  const evLevel = getEvLevel(evScore);

  const destTypeLabel = destinationTypeOptions.find((o) => o.value === form.destinationType)?.label || '未选择';

  return {
    tripProfile: {
      destination: form.destination || '未填写',
      type: destTypeLabel,
      people: peopleOptions.find((o) => o.value === form.peopleCount)?.label || '',
      luggage: luggageOptions.find((o) => o.value === form.luggage)?.label || '',
      intensity: intensityOptions.find((o) => o.value === form.tripIntensity)?.label || '',
      preference: preferenceOptions.find((o) => o.value === form.preference)?.label || '',
    },
    primary: prefResult,
    reasons,
    notRecommended,
    directions,
    energyAdvice: prefResult.energyAdvice,
    extraNotes: prefResult.extraNotes || [],
    evScore: evLevel,
    evRawScore: evScore,
    destContext,
  };
}

/* —— 第一步：人数 + 行李 → 基础车型 —— */

function buildProfile(form) {
  const key = `${form.peopleCount}|${form.luggage}`;
  const map = {
    '1-2|light':  { category: '经济轿车 / 紧凑型 SUV', models: '卡罗拉、飞度、比亚迪秦 PLUS、探歌', size: 'compact', energyOpen: true },
    '1-2|medium': { category: '紧凑型 SUV / 中型 SUV',   models: 'RAV4 荣放、本田 CR-V、哈弗大狗、逍客', size: 'compact-mid', energyOpen: true },
    '1-2|heavy':  { category: '紧凑型 SUV / 中型 SUV',   models: 'RAV4 荣放、坦克300、本田 CR-V、途观 L', size: 'mid', energyOpen: true },
    '3-4|light':  { category: '紧凑型 SUV / 中型 SUV',   models: 'RAV4 荣放、本田 CR-V、哈弗大狗、逍客', size: 'compact-mid', energyOpen: true },
    '3-4|medium': { category: '中型 SUV',                 models: 'RAV4 荣放、本田 CR-V、途观 L、坦克300', size: 'mid', energyOpen: true },
    '3-4|heavy':  { category: '中大型 SUV',               models: '汉兰达、坦克500、途昂、理想 L9', size: 'mid-large', energyOpen: true },
    '5|light':    { category: '中大型 SUV / MPV',         models: '汉兰达、GL8、理想 L9、途昂', size: 'large', energyOpen: true },
    '5|medium':   { category: '中大型 SUV / MPV',         models: 'GL8、汉兰达、理想 L9、途昂', size: 'large', energyOpen: true },
    '5|heavy':    { category: '中大型 SUV / MPV',         models: 'GL8、赛那、理想 L9、途昂', size: 'large', energyOpen: true },
    '6+|light':   { category: 'MPV 优先',                  models: 'GL8、赛那、传祺 M8、奥德赛', size: 'xlarge', energyOpen: false },
    '6+|medium':  { category: 'MPV 优先',                  models: 'GL8、赛那、传祺 M8、威然', size: 'xlarge', energyOpen: false },
    '6+|heavy':   { category: 'MPV 优先',                  models: 'GL8、赛那、大通 G90、威然', size: 'xlarge', energyOpen: false },
  };
  return map[key] || map['3-4|medium'];
}

/* —— 第二步：目的地类型修正 —— */

function applyDestination(destType, base) {
  const energy = { ...base };
  energy.destNotes = [];

  switch (destType) {
    case 'city-short':
      energy.destNotes.push('城市周边路况好、充电方便，可以偏经济车型，不必盲目租大车。');
      energy.energyType = 'both';
      energy.energyLabel = '油车 / 新能源均可';
      energy.energyLevel = 'both';
      energy.destBias = 'economy';
      break;

    case 'island-leisure':
      energy.destNotes.push('海岛和城市轻松游路况整体较好，经济轿车和紧凑型 SUV 完全够用。');
      energy.destNotes.push('新能源车型在这个场景下优势明显：使用成本低、充电设施完善。');
      energy.energyType = 'electric';
      energy.energyLabel = '新能源友好';
      energy.energyLevel = 'ev-friendly';
      energy.destBias = 'economy-ev';
      break;

    case 'mountain-plateau':
      energy.destNotes.push('山路多弯、海拔变化大，SUV 视野和通过性明显优于轿车。');
      energy.destNotes.push('低动力车型在高原和连续爬坡路段可能吃力，建议选择动力储备充足的车型。');
      energy.energyType = 'oil';
      energy.energyLabel = '建议油车 / 增程';
      energy.energyLevel = 'recommend-oil';
      energy.destBias = 'suv-up';
      break;

    case 'grassland-long':
      energy.destNotes.push('地广人稀、部分路段为非铺装路面，中型以上 SUV 的通过性和舒适性更有保障。');
      energy.destNotes.push('加油站间隔较大，油车补能确定性更高，纯电车型需要仔细规划补能点。');
      energy.energyType = 'oil';
      energy.energyLabel = '建议油车';
      energy.energyLevel = 'recommend-oil-strong';
      energy.destBias = 'mid-suv-up';
      break;

    case 'loop-long':
      energy.destNotes.push('跨城长途对空间、舒适性和续航容错率要求较高，建议中型以上车型。');
      energy.destNotes.push('增程车型在这个场景下是比较理想的折中：电驱静谧 + 加油补能便利。');
      energy.energyType = 'oil';
      energy.energyLabel = '建议油车 / 增程';
      energy.energyLevel = 'recommend-oil';
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

/* —— 第三步：行程强度修正 —— */

function applyIntensity(intensity, profile) {
  const result = { ...profile, intensityNotes: [] };

  switch (intensity) {
    case 'easy':
      result.intensityNotes.push('行程轻松，对车辆续航和舒适性要求不高，选择可以更灵活。');
      result.intensityBias = 'relaxed';
      break;
    case 'medium':
      result.intensityNotes.push('每天有一定驾驶距离，建议选择座椅支撑好、隔音不错的车型。');
      result.intensityBias = 'balanced';
      break;
    case 'high':
      result.intensityNotes.push('行程强度较高，推荐座椅舒适、续航长、隔音好的车型，长时间驾驶更轻松。');
      result.intensityNotes.push('可以优先考虑带辅助驾驶功能的车型，减轻长途疲劳。');
      result.intensityBias = 'comfort-up';
      break;
    default:
      result.intensityBias = 'balanced';
      break;
  }

  return result;
}

/* —— 第四步：用车偏好修正 —— */

function applyPreference(preference, profile) {
  const result = { ...profile, prefNotes: [], extraNotes: [] };
  result.energyAdvice = {
    recommended: profile.energyLabel || '油车',
    level: profile.energyLevel || 'recommend-oil',
    reason: profile.destNotes.join(''),
  };

  switch (preference) {
    case 'budget':
      result.prefNotes.push('不必盲目上大车，先满足空间下限和行程强度的最低要求即可。');
      result.prefNotes.push('建议用"比租车方案"功能横向对比不同平台同车型的含保险总价。');
      result.prefBias = 'economy';
      break;

    case 'comfort':
      result.prefNotes.push('建议在基础推荐上提升一个车型级别，优先选空间大、隔音好的车型。');
      result.prefNotes.push('关注座椅通风/加热、辅助驾驶、悬挂舒适度等配置。');
      result.prefBias = 'upsize';
      break;

    case 'photo':
      result.prefNotes.push('个性车型（敞篷、硬派越野、复古车型等）可以作为加分项，拍照出片率高。');
      result.prefNotes.push('但建议不要为了拍照牺牲空间和续航容错率，尤其是长途或多人出行时。');
      result.prefBias = 'style';
      break;

    case 'ev':
      result.prefNotes.push('优先看纯电和增程车型，日常使用成本更低、驾驶静谧性更好。');
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

    case 'reliable':
      result.prefNotes.push('建议优先油车、混动或增程，加油站覆盖率高，不依赖充电规划。');
      result.prefNotes.push('选择保有量大、维修方便的车型（如 RAV4、CR-V、卡罗拉），减少不确定性。');
      if (profile.energyLevel === 'ev-friendly') {
        result.extraNotes.push('虽然这个目的地新能源友好，但如果你更看重省心，油车仍然是容错率最高的选择。');
      }
      result.prefBias = 'reliable';
      break;

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
    if (profile.size !== 'xlarge' && form.preference === 'ev') {
      alternatives.push('增程 SUV（理想 L 系列、问界 M 系列）— 兼顾电驱和补能便利');
    }
    alternatives.push('同级别混动车型 — 油耗更低，适合长途');
  } else if (profile.energyLevel === 'ev-friendly' || profile.energyLevel === 'both') {
    alternatives.push('同级别纯电车型 — 使用成本更低，适合充电方便的行程');
    alternatives.push('同级别增程车型 — 无续航焦虑的电驱体验');
  }

  // 可选：预算降级
  if (form.preference === 'budget' && baseIdx > 0) {
    const downSize = sizeOrder[baseIdx - 1];
    alternatives.push(`如果预算紧张，${sizeLabel(downSize)}也可以考虑，前提是满足空间下限`);
  }

  // 可选：舒适升级
  if ((form.preference === 'comfort' || form.tripIntensity === 'high') && baseIdx < sizeOrder.length - 1) {
    const upSize = sizeOrder[baseIdx + 1];
    if (upSize !== 'xlarge' || form.peopleCount === '6+') {
      alternatives.push(`如果预算允许，${sizeLabel(upSize)}的舒适性和空间更好`);
    }
  }

  // 可选：个性车型
  if (form.preference === 'photo' && ['city-short', 'island-leisure'].includes(form.destinationType)) {
    alternatives.push('敞篷 / 个性车型 — 拍照出片，适合轻松路线的氛围感出行');
  }
  if (form.preference === 'photo' && ['mountain-plateau', 'grassland-long'].includes(form.destinationType)) {
    alternatives.push('硬派越野（牧马人、坦克300）— 车身造型本身就很出片');
  }

  // 谨慎
  if (['mountain-plateau', 'grassland-long', 'loop-long'].includes(form.destinationType)) {
    cautious.push('低动力经济型轿车 — 高原或长途路段动力储备可能不足');
    if (form.destinationType === 'grassland-long' || form.destinationType === 'loop-long') {
      cautious.push('纯电车型（无增程）— 偏远路段充电设施不确定，需要仔细规划补能');
    }
    if (form.destinationType === 'mountain-plateau') {
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
  const intensity = form.tripIntensity;
  const pref = form.preference;

  // 主线：目的地场景描述 + 车型大方向
  reasons.push(mainAdvice(dest, people, luggage, profile, destContext));

  // 副线 1：人数和行李的具体建议
  const sizeNote = peopleLuggageNote(people, luggage, profile);
  if (sizeNote) reasons.push(sizeNote);

  // 副线 2：行程强度的补充提醒
  const intensityNote = intensityTip(intensity, dest, destContext);
  if (intensityNote) reasons.push(intensityNote);

  // 副线 3：偏好对选择的影响
  const prefNote = preferenceTip(pref, dest, profile, destContext);
  if (prefNote) reasons.push(prefNote);

  return reasons;
}

function mainAdvice(dest, people, luggage, profile, destContext) {
  const category = profile.category;
  const destName = destContext ? destContext.name : '';
  const peopleLabel = people === '1-2' ? '1-2 人' : people === '3-4' ? '3-4 人' : people === '5' ? '5 人' : '6 人及以上';
  const heavySuffix = luggage === 'heavy' ? '；行李较多的话建议往上选一个尺寸级别，确保每人都有舒服的乘坐空间' : '';

  // —— 有真实目的地数据时，用目的地特征写文案 ——
  if (destContext) {
    if (people === '1-2') {
      if (dest === 'island-leisure' || destContext.altitudeRisk === '低') {
        return `${destName}路况轻松、补能便利，对车型硬性要求不高。${peopleLabel}出行，${category}完全够用，不用盲目租大车——把预算留给路上的体验和美食更划算。`;
      }
      if (dest === 'grassland-long' || dest === 'loop-long') {
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
        return `山路和高原路线可能遇到爬坡、海拔变化和天气波动。1-2 人出行，${category}够用，但建议不要只盯着最低租金选车——动力储备和刹车稳定性在高海拔路段比省几十块租金更重要。`;
      }
      if (people === '3-4') {
        return `山路和高原路线对车辆的动力、底盘和刹车稳定性要求比城市道路高。3-4 人出行，${category}在空间和通过性上比较理想${luggage === 'heavy' ? '；行李较多的话，建议确认后备箱能否装下所有人的装备' : ''}。`;
      }
      return `山路和高原路线，${people === '5' ? '5 人' : '6 人及以上'}出行。满员跑山路时车辆负载较大，${category}在动力和制动上更有余量，不建议在这个场景下选小排量或小型车。`;

    case 'island-leisure':
      if (people === '1-2') {
        return `海岛和城市轻松游的路况整体比较友好，城市和景区之间距离通常可控。1-2 人出行，${category}完全够用，不用盲目租大车——把预算留给体验和美食可能更划算。`;
      }
      return `海岛和城市轻松游对车型的硬性要求不高。${people === '3-4' ? '3-4 人' : '多人'}出行，${category}在空间和舒适性上刚好${luggage === 'heavy' ? '；如果行李很多，可以考虑再往上选一级尺寸' : ''}。这个场景下新能源车型的使用成本优势也比较明显。`;

    case 'loop-long':
      if (people === '1-2') {
        return `大环线或跨城长途，每天在车上的时间不短。1-2 人出行，${category}够用，但长途舒适性值得多花一点预算——好的座椅和隔音会让整趟体验差别很大。`;
      }
      if (people === '3-4') {
        return `大环线或跨城长途，车型选择不要只看日租金便宜。3-4 人出行，${category}在空间、舒适性和续航容错率上比较均衡${luggage === 'heavy' ? '；行李较多的话，中大型 SUV 或 MPV 的后备箱会更从容' : ''}。`;
      }
      return `大环线或跨城长途，${people === '5' ? '5 人' : '6 人及以上'}出行。这个人数在长途路线上，${category}是更合理的选择——每天开车时间较长的话，每个人的乘坐舒适性都会被放大。`;

    case 'city-short':
      if (people === '1-2') {
        return `城市周边短途对车型的硬性要求不高，重点看预算和舒适性就够了。1-2 人出行，${category}完全可以胜任，不需要为"万一用得上"而租一辆大车。`;
      }
      return `城市周边短途，${people === '3-4' ? '3-4 人' : '多人'}出行。${category}在空间和灵活性上比较合适${luggage === 'heavy' ? '；行李较多的话可以考虑紧凑型 SUV 或中型 SUV' : ''}。城市周边充电方便，新能源车型的使用成本优势也比较突出。`;

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

function intensityTip(intensity, dest, destContext) {
  const destName = destContext ? destContext.name : '';

  switch (intensity) {
    case 'high':
      if (dest === 'loop-long' || dest === 'grassland-long') {
        return `行程强度较高${destName ? `，${destName}又是长距离路线` : '，又是长距离路线'}，建议优先考虑带辅助驾驶、座椅支撑好、隔音到位的车型。长途下来，这些配置的体验差异比想象中大。`;
      }
      return `行程强度较高${destName ? `，${destName}每天驾驶时间不短` : '，每天驾驶时间不短'}。座椅舒适性、隔音和辅助驾驶值得多花一点预算——省下的疲劳比省下的租金更值。`;
    case 'medium':
      return '中等强度的行程，舒适性和经济性可以兼顾，不需要为了"万一"而过度升级车型。';
    default:
      return null;
  }
}

function preferenceTip(pref, dest, profile, destContext) {
  const destName = destContext ? destContext.name : '';

  switch (pref) {
    case 'budget':
      return '你偏好省钱，这个思路在车型选择上完全可以成立——先满足空间和行程强度的下限，再在同级别里找价格更友好的平台和方案，不必盲目追高。';
    case 'comfort':
      if (dest === 'loop-long' || dest === 'grassland-long') {
        return `你偏好舒适${destName ? `，在${destName}这类长距离路线上正好匹配` : '，在这类长距离路线上正好匹配'}——建议在基础推荐上提升一个车型级别，长途体验会明显更好。`;
      }
      return '你偏好舒适，建议在预算可接受的范围内优先看空间更大、隔音更好、座椅更舒服的车型。短途可能感觉不出差别，但一整趟下来体验差异很明显。';
    case 'photo':
      if (dest === 'island-leisure' || dest === 'city-short') {
        return `拍照和体验优先的话${destName ? `，${destName}的敞篷、个性车型确实是加分项` : '，海岛或城市周边的敞篷、个性车型确实是加分项'}，出片率很高。不过建议先确认行李能不能装下，别为了造型牺牲实用性。`;
      }
      if (dest === 'mountain-plateau' || dest === 'grassland-long') {
        return `拍照和体验优先${destName ? `，${destName}沿途硬派越野的造型本身就是很好的拍摄元素` : '，硬派越野的造型本身就是很好的拍摄元素'}。但注意不要为了外观牺牲空间和续航容错率——毕竟这趟路线本身对车辆的要求就不低。`;
      }
      return '你偏好拍照和体验，可以在满足基本空间和续航要求的前提下，优先看造型更有辨识度的车型。';
    case 'ev':
      if (dest === 'grassland-long' || dest === 'loop-long') {
        if (destContext && destContext.energyHint) {
          return `你偏好新能源，但${destName}补能条件需要提前确认。${destContext.energyHint}`;
        }
        return '你偏好新能源，但这类长距离路线补能条件需要提前确认。增程车型是兼顾电驱体验和长途补能安全的折中选择——既有新能源的静谧和低成本，又不需要完全依赖充电站。';
      }
      if (dest === 'mountain-plateau') {
        if (destContext && destContext.energyHint) {
          return `你偏好新能源，${destName}对续航管理要求更高。${destContext.energyHint}`;
        }
        return '你偏好新能源，山路和高原路线对续航管理要求更高。建议优先看增程或混动，纯电的话需要提前确认沿途充电站的覆盖情况。';
      }
      if (destContext && destContext.energyHint) {
        return `你偏好新能源，${destName}整体对新能源比较友好。${destContext.energyHint}`;
      }
      return '你偏好新能源，在这个目的地场景下是比较匹配的。重点关注车辆续航、住宿地充电条件和还车电量要求即可。';
    case 'reliable':
      if (dest === 'grassland-long' || dest === 'loop-long' || dest === 'mountain-plateau') {
        if (destName) {
          return `你偏好稳定省心，在${destName}这条路上这个思路很务实——油车或混动的补能确定性最高，把精力留给风景而不是充电规划。`;
        }
        return '你偏好稳定省心，在这类路线上这个思路很务实——油车或混动的补能确定性最高，把精力留给风景而不是充电规划。';
      }
      return '你偏好稳定省心，建议优先看保有量大、维修网络完善的车型。油车或混动在这个场景下是最不用操心的选择。';
    default:
      return null;
  }
}

/* —— 第七步：不太建议的车型方向 —— */

function buildNotRecommended(profile, form, destContext) {
  const items = [];
  const dest = form.destinationType;
  const destName = destContext ? destContext.name : '';

  if (['mountain-plateau', 'grassland-long', 'loop-long'].includes(dest)) {
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

  if (form.peopleCount === '6+' && !profile.category.includes('MPV')) {
    items.push('5 座 SUV 硬塞 6 人 — 不光坐着不舒服，也不合规，建议直接看 MPV');
  }

  if (form.peopleCount === '5' && (profile.size === 'compact' || profile.size === 'compact-mid')) {
    items.push('紧凑型 SUV 坐 5 人 — 后排中间位置长途会比较难受，后备箱也可能塞不下所有人的行李');
  }

  if (form.tripIntensity === 'high' && (profile.size === 'compact' || profile.size === 'compact-mid')) {
    items.push('紧凑型车跑高强度行程 — 每天长时间驾驶，座椅和隔音的短板会被放大，到达目的地后的疲劳感会更明显');
  }

  return items;
}

/* —— 第八步：新能源适配评分 —— */

function calculateEvScore(form) {
  let score = 100;

  // 目的地类型
  if (form.destinationType === 'mountain-plateau') score -= 25;
  if (form.destinationType === 'grassland-long') score -= 20;
  if (form.destinationType === 'loop-long') score -= 25;
  if (form.destinationType === 'island-leisure') score += 15;
  if (form.destinationType === 'city-short') score += 10;

  // 行程强度
  if (form.tripIntensity === 'high') score -= 20;

  // 行李
  if (form.luggage === 'heavy') score -= 10;

  // 人数
  if (form.peopleCount === '5' || form.peopleCount === '6+') score -= 10;

  // 用车偏好
  if (form.preference === 'reliable') score -= 15;
  if (form.preference === 'ev') score += 15;

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
  destination: '',
  destinationType: '',
  peopleCount: '',
  luggage: '',
  tripIntensity: '',
  preference: '',
};

export default function CarRecommendPage() {
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState('');

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setResult(null);
    setFeedback('');
  };

  const canGenerate = form.destinationType && form.peopleCount && form.luggage && form.tripIntensity && form.preference;

  const handleGenerate = () => {
    if (!form.destination.trim()) {
      setFeedback('可以先输入一个大致目的地，例如伊犁、川西、海南。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!canGenerate) {
      setFeedback('还有选项没选完，补充完整后建议会更准确。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFeedback('');
    setResult(generateRecommendation(form));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm(emptyForm);
    setResult(null);
    setFeedback('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-cream">
      <TopBar title="目的地车型推荐" />

      <section className="safe-bottom-action px-4 pt-4">
        <IntroCard />

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
            <FormField label="你准备去哪自驾？" icon={MapPin}>
              <input
                value={form.destination}
                onChange={(e) => update('destination', e.target.value)}
                placeholder="例如：伊犁、川西、海南、云南、青甘环线、重庆周边"
                className="h-12 w-full rounded-[16px] border border-pine/15 bg-aquaCard/70 px-3.5 text-[15px] font-semibold text-ink outline-none transition placeholder:text-muted/55 focus:border-pine focus:bg-card focus:ring-2 focus:ring-pine/10"
              />
            </FormField>

            <OptionField
              label="目的地类型"
              icon={Compass}
              options={destinationTypeOptions}
              value={form.destinationType}
              onChange={(v) => update('destinationType', v)}
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
              label="行程强度"
              icon={CarFront}
              options={intensityOptions}
              value={form.tripIntensity}
              onChange={(v) => update('tripIntensity', v)}
              cols="full"
            />

            <OptionField
              label="用车偏好"
              icon={Sparkles}
              options={preferenceOptions}
              value={form.preference}
              onChange={(v) => update('preference', v)}
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
        <BottomActionBar layout="double">
          <BottomActionButton as={Link} to="/price-compare" variant="secondary">
            去对比租车方案
          </BottomActionButton>
          <BottomActionButton as={Link} to="/budget">
            去算整趟预算
            <ArrowRight size={17} />
          </BottomActionButton>
        </BottomActionBar>
      ) : null}
    </main>
  );
}

/* ========================================================================
   表单子组件
   ======================================================================== */

function IntroCard() {
  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-aquaCard text-xl" aria-hidden="true">
          🚗
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-ink">目的地车型推荐</h1>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted">
            不用纠结轿车、SUV、MPV 还是新能源，先根据这趟行程判断大方向。
          </p>
          <p className="mt-2 rounded-2xl bg-amberSoft/45 px-3 py-2 text-xs font-bold leading-relaxed text-amberDark ring-1 ring-warning/20">
            免费轻量建议，帮你判断车型和能源大方向，不做具体车型排行榜和平台比价。
          </p>
        </div>
      </div>
    </section>
  );
}

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
              className={`flex min-h-11 items-center gap-2 rounded-[16px] px-3 py-2.5 text-left text-sm font-bold leading-snug transition active:scale-[0.98] ${
                active
                  ? 'bg-pine text-white shadow-sm shadow-pine/15'
                  : 'bg-aquaCard text-muted hover:bg-mint hover:text-ink'
              }`}
            >
              {OptIcon ? <OptIcon size={16} className="shrink-0" /> : null}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function buildResultCopyText(result, form, insuranceAdvice, insuranceSuggestions) {
  const dc = result.destContext;
  const lines = [
    '【我的车型建议】',
    `目的地：${form.destination || '未填写'}`,
    dc ? `路线概况：${dc.intro}` : null,
    `目的地类型：${result.tripProfile.type}`,
    `出行人数：${result.tripProfile.people}`,
    `行李：${result.tripProfile.luggage}`,
    `行程强度：${result.tripProfile.intensity}`,
    `用车偏好：${result.tripProfile.preference}`,
    '',
    `优先推荐：${result.primary.category}`,
    `参考车型：${result.primary.models}`,
    `新能源适配：${result.evScore.level}（${result.evRawScore} 分）`,
    '',
  ].filter(Boolean);

  if (result.reasons.length) {
    lines.push('推荐理由：');
    result.reasons.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
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

/* ========================================================================
   结果展示 — 5 张手机端友好卡片
   ======================================================================== */

function ResultView({ result, form }) {
  const { tripProfile, primary, reasons, notRecommended, energyAdvice, evScore, destContext } = result;
  const [copyState, setCopyState] = useState('idle'); // idle | ok | fail

  const handleCopy = async () => {
    const text = buildResultCopyText(result, form, insuranceAdvice, insuranceSuggestions);
    const ok = await copyToClipboard(text);
    setCopyState(ok ? 'ok' : 'fail');
    setTimeout(() => setCopyState('idle'), 3000);
  };

  // 获取车型示例 + 生成一句话总结 + 关键词 + 不建议理由
  const topVehicles = getTopVehicleExamples(form.destination, {
    peopleCount: form.peopleCount,
    luggageLevel: form.luggage,
    budgetPreference: form.preference,
    energyPreference: form.preference,
  });
  const oneLiner = buildOneLinerSummary(destContext, result, topVehicles, form);
  const keywords = buildSearchKeywords(topVehicles);
  const whyNotAdvices = buildWhyNotAdvice(topVehicles, form.destination, {
    budgetPreference: form.preference,
    peopleCount: form.peopleCount,
  });
  const tradeOff = buildTradeOffAdvice(destContext, form);
  const dataNotice = buildDataNotice(destContext, topVehicles, form);

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

      {/* === 数据提示横幅 === */}
      {dataNotice.message ? (
        <div className={`rounded-2xl px-4 py-3 text-sm font-bold leading-relaxed ${
          dataNotice.level === 'tip'
            ? 'bg-aquaCard/70 text-pine ring-1 ring-pine/10'
            : 'bg-amberSoft/30 text-amberDark'
        }`}>
          {dataNotice.message}
        </div>
      ) : null}

      {/* === 卡片 1：推荐方向 === */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">推荐方向</h2>
        </div>

        {/* 优先推荐车型 */}
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-mint/70 to-mint/30 px-4 py-3 ring-1 ring-pine/10">
          <p className="text-[11px] font-bold text-muted">优先推荐</p>
          <p className="mt-0.5 text-xl font-bold text-pine">{primary.category}</p>
          <p className="mt-0.5 text-sm font-medium text-ink">{primary.models}</p>
        </div>

        {/* 能源方向 */}
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-aquaCard px-3 py-2.5">
          {energyAdvice.level === 'ev-friendly' || energyAdvice.level === 'recommend-extended'
            ? <BatteryCharging size={15} className="shrink-0 text-pine" />
            : <Fuel size={15} className="shrink-0 text-amberDark" />
          }
          <p className="text-sm font-bold text-ink">{energyAdvice.recommended}</p>
        </div>

        {/* 具体车型示例 */}
        <div className="mt-3">
          <p className="text-xs font-bold text-muted">具体车型参考</p>
          {topVehicles.length > 0 ? (
            <div className="mt-2 grid gap-2">
              {topVehicles.slice(0, 3).map((v) => (
                <div key={v.vehicleId} className="flex items-start gap-2.5 rounded-2xl bg-aquaCard/70 px-3 py-2.5">
                  <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    v.recommendationLevel === '强烈推荐' ? 'bg-pine text-white' : 'bg-mint text-pine'
                  }`}>
                    {v.overallScore || '-'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{v.brand || ''}{v.model || ''} <span className="text-xs font-medium text-muted">{v.energyType || ''}</span></p>
                    {v.summarySentence ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{v.summarySentence}</p>
                    ) : null}
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

      {/* === 卡片 2：为什么适合 === */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">为什么适合</h2>
        </div>
        <div className="mt-3 grid gap-2">
          {/* 目的地路况 */}
          {destContext ? (
            <FitRow icon={<MapPin size={14} />} label="路况特征">
              {destContext.highlights || destContext.routeSummary}
            </FitRow>
          ) : null}
          {/* 人数行李 */}
          <FitRow icon={<Users size={14} />} label="人数行李">
            {tripProfile.people}出行{tripProfile.luggage !== '少：背包 / 登机箱为主' ? `，${tripProfile.luggage}` : ''}
            {primary.category ? `，${primary.category}刚好` : ''}
          </FitRow>
          {/* 补能 */}
          {destContext ? (
            <FitRow icon={destContext.chargingCondition === '好' ? <BatteryCharging size={14} /> : <Fuel size={14} />} label="补能条件">
              {destContext.chargingCondition === '好'
                ? '充电设施完善，纯电和增程都很方便'
                : destContext.chargingCondition === '一般'
                  ? '充电设施一般，增程或混动更稳妥'
                  : '充电设施不足，油车或增程更省心'}
            </FitRow>
          ) : null}
          {/* 难度因素 */}
          {destContext && (destContext.altitudeRisk !== '低' || destContext.beginnerDifficulty !== '简单') ? (
            <FitRow icon={<Mountain size={14} />} label="路况难度">
              {[
                destContext.altitudeRisk !== '低' ? `海拔风险${destContext.altitudeRisk}` : '',
                destContext.beginnerDifficulty !== '简单' ? `新手难度${destContext.beginnerDifficulty}` : '',
                destContext.comfortImportance === '高' ? '长途舒适性要求高' : '',
              ].filter(Boolean).join('，')}
            </FitRow>
          ) : null}
          {/* 行程强度 */}
          {form.tripIntensity === 'high' ? (
            <FitRow icon={<CarFront size={14} />} label="行程强度">
              行程较赶，座椅和隔音值得多花预算
            </FitRow>
          ) : null}
        </div>
      </section>

      {/* === 卡片 3：能源怎么选 === */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
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
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
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

        {/* 目的地轻量提醒 */}
        {destContext ? (
          <DestinationSearchTip destContext={destContext} />
        ) : null}
      </section>

      {/* === 卡片 5：为什么不建议这样选 === */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
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
      />

      {/* === 底部操作 === */}
      <section className="rounded-[24px] border border-pine/10 bg-aquaCard p-4 shadow-card">
        <div className="grid gap-2.5">
          <Link
            to="/budget"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#174B63] to-[#1E6B8A] px-4 text-sm font-bold text-white shadow-lg shadow-pine/20"
          >
            去算这趟预算
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/price-compare"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-card px-4 text-sm font-bold text-pine ring-1 ring-pine/15"
          >
            对比两个租车方案
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
          当前为免费轻量建议，主要帮你判断车型和能源大方向。
        </p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-muted">
          具体车型、平台价格和补能路线，建议结合实际车源再确认。
        </p>
      </div>
    </div>
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
    destination: form.destination || '',
    destinationType: form.destinationType || '',
    tripIntensity: form.tripIntensity || '',
    peopleCount: form.peopleCount || form.people || '',
    people: form.peopleCount || form.people || '',
    tripDays: result?.tripProfile ? form.tripDays : '',
    preference: form.preference || '',
    isBeginner: false,
    experience: '',
    budgetConscious: form.preference === 'budget',
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

function InsuranceAdviceCard({ advice, suggestions, destContext }) {
  if (!advice) return null;

  return (
    <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
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
                方案名称来自平台公开页面和用户截图，实际以下单页为准
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

const BUSY_DESTINATIONS = ['伊犁环线', '川西小环线', '青甘大环线', '昆大丽香线'];
const EV_FRIENDLY_DESTINATIONS = ['海南环岛自驾'];

function DestinationSearchTip({ destContext }) {
  if (!destContext) return null;

  const name = destContext.name;

  if (EV_FRIENDLY_DESTINATIONS.includes(name)) {
    return (
      <div className="mt-2.5 rounded-2xl bg-aquaCard px-3 py-2.5 ring-1 ring-pine/10">
        <p className="text-xs font-medium leading-relaxed text-ink">
          海南补能相对方便，可以把纯电车也纳入搜索范围，但节假日价格波动会比较明显，建议尽早锁定车源。
        </p>
      </div>
    );
  }

  if (BUSY_DESTINATIONS.includes(name)) {
    return (
      <div className="mt-2.5 rounded-2xl bg-amberSoft/30 px-3 py-2.5">
        <p className="text-xs font-medium leading-relaxed text-amberDark">
          热门自驾目的地旺季车源紧张，建议先锁定 SUV 或混动 SUV，再比较保险方案和异地还车费用。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2.5 rounded-2xl bg-aquaCard/50 px-3 py-2.5">
      <p className="text-xs font-medium leading-relaxed text-ink">
        建议结合目的地实际情况，提前确认取还车地点和保险方案。
      </p>
    </div>
  );
}
