import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Car,
  CarFront,
  CheckCircle2,
  Compass,
  Copy,
  Fuel,
  Info,
  Luggage,
  MapPin,
  Mountain,
  Ship,
  Sparkles,
  UserCheck,
  Users,
  Waves,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomActionBar, { BottomActionButton } from '../components/BottomActionBar.jsx';
import TopBar from '../components/TopBar.jsx';

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
  const directions = buildDirections(prefResult, form);
  const reasons = buildReasons(prefResult, form);
  const notRecommended = buildNotRecommended(prefResult, form);
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

function buildReasons(profile, form) {
  const reasons = [];
  const dest = form.destinationType;
  const people = form.peopleCount;
  const luggage = form.luggage;
  const intensity = form.tripIntensity;
  const pref = form.preference;

  // 主线：目的地场景描述 + 车型大方向
  reasons.push(mainAdvice(dest, people, luggage, profile));

  // 副线 1：人数和行李的具体建议
  const sizeNote = peopleLuggageNote(people, luggage, profile);
  if (sizeNote) reasons.push(sizeNote);

  // 副线 2：行程强度的补充提醒
  const intensityNote = intensityTip(intensity, dest);
  if (intensityNote) reasons.push(intensityNote);

  // 副线 3：偏好对选择的影响
  const prefNote = preferenceTip(pref, dest, profile);
  if (prefNote) reasons.push(prefNote);

  return reasons;
}

function mainAdvice(dest, people, luggage, profile) {
  const category = profile.category;

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

function intensityTip(intensity, dest) {
  switch (intensity) {
    case 'high':
      if (dest === 'loop-long' || dest === 'grassland-long') {
        return '行程强度较高，又是长距离路线，建议优先考虑带辅助驾驶、座椅支撑好、隔音到位的车型。长途下来，这些配置的体验差异比想象中大。';
      }
      return '行程强度较高，每天驾驶时间不短。座椅舒适性、隔音和辅助驾驶值得多花一点预算——省下的疲劳比省下的租金更值。';
    case 'medium':
      return '中等强度的行程，舒适性和经济性可以兼顾，不需要为了"万一"而过度升级车型。';
    default:
      return null;
  }
}

function preferenceTip(pref, dest, profile) {
  switch (pref) {
    case 'budget':
      return '你偏好省钱，这个思路在车型选择上完全可以成立——先满足空间和行程强度的下限，再在同级别里找价格更友好的平台和方案，不必盲目追高。';
    case 'comfort':
      if (dest === 'loop-long' || dest === 'grassland-long') {
        return '你偏好舒适，在这类长距离路线上正好匹配——建议在基础推荐上提升一个车型级别，长途体验会明显更好。';
      }
      return '你偏好舒适，建议在预算可接受的范围内优先看空间更大、隔音更好、座椅更舒服的车型。短途可能感觉不出差别，但一整趟下来体验差异很明显。';
    case 'photo':
      if (dest === 'island-leisure' || dest === 'city-short') {
        return '拍照和体验优先的话，海岛或城市周边的敞篷、个性车型确实是加分项，出片率很高。不过建议先确认行李能不能装下，别为了造型牺牲实用性。';
      }
      if (dest === 'mountain-plateau' || dest === 'grassland-long') {
        return '拍照和体验优先，硬派越野的造型本身就是很好的拍摄元素。但注意不要为了外观牺牲空间和续航容错率——毕竟这趟路线本身对车辆的要求就不低。';
      }
      return '你偏好拍照和体验，可以在满足基本空间和续航要求的前提下，优先看造型更有辨识度的车型。';
    case 'ev':
      if (dest === 'grassland-long' || dest === 'loop-long') {
        return '你偏好新能源，但这类长距离路线补能条件需要提前确认。增程车型是兼顾电驱体验和长途补能安全的折中选择——既有新能源的静谧和低成本，又不需要完全依赖充电站。';
      }
      if (dest === 'mountain-plateau') {
        return '你偏好新能源，山路和高原路线对续航管理要求更高。建议优先看增程或混动，纯电的话需要提前确认沿途充电站的覆盖情况。';
      }
      return '你偏好新能源，在这个目的地场景下是比较匹配的。重点关注车辆续航、住宿地充电条件和还车电量要求即可。';
    case 'reliable':
      if (dest === 'grassland-long' || dest === 'loop-long' || dest === 'mountain-plateau') {
        return '你偏好稳定省心，在这类路线上这个思路很务实——油车或混动的补能确定性最高，把精力留给风景而不是充电规划。';
      }
      return '你偏好稳定省心，建议优先看保有量大、维修网络完善的车型。油车或混动在这个场景下是最不用操心的选择。';
    default:
      return null;
  }
}

/* —— 第七步：不太建议的车型方向 —— */

function buildNotRecommended(profile, form) {
  const items = [];
  const dest = form.destinationType;

  if (['mountain-plateau', 'grassland-long', 'loop-long'].includes(dest)) {
    if (profile.size === 'compact' || profile.size === 'compact-mid') {
      items.push(dest === 'mountain-plateau'
        ? '低底盘轿车跑山路 — 通过性不足，遇到非铺装路面或陡坡会比较吃力'
        : '低底盘轿车跑长距离 — 非铺装路面和烂路的通过性不够，长途舒适性也有限');
    }
  }

  if (dest === 'grassland-long' || dest === 'loop-long') {
    items.push('纯电车型（非增程）— 偏远路段的充电站覆盖还不能完全放心，补能便利性需要出发前仔细确认');
  }

  if (dest === 'mountain-plateau') {
    items.push('小排量自然吸气车型 — 高海拔含氧量低，动力衰减会比平原明显，超车和爬坡时可能不够从容');
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
      badge: 'bg-amberSoft/45 text-[#735B16]',
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
          <p className="mt-3 rounded-2xl bg-amberSoft/45 px-3 py-2 text-xs font-bold leading-relaxed text-[#735B16]" role="status">
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
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#356F67] to-[#4A8F83] px-4 text-sm font-bold text-white shadow-lg shadow-pine/20 active:scale-[0.99]"
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
          <p className="mt-2 rounded-2xl bg-amberSoft/45 px-3 py-2 text-xs font-bold leading-relaxed text-[#735B16] ring-1 ring-warning/20">
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

/* —— 标签生成 —— */

function buildTags(form, evRawScore) {
  const tags = [];
  const destTagMap = {
    'city-short': '城市短途',
    'island-leisure': '海岛轻松',
    'mountain-plateau': '山路高原',
    'grassland-long': '长距离',
    'loop-long': '长距离',
    unsure: '待确认',
  };
  const tag = destTagMap[form.destinationType];
  if (tag) tags.push(tag);

  if (form.luggage === 'heavy') tags.push('行李较多');
  if (form.tripIntensity === 'high') tags.push('行程较赶');
  if (form.peopleCount === '5' || form.peopleCount === '6+') tags.push('多人出行');
  if (evRawScore < 60) tags.push('补能需谨慎');
  if (form.preference === 'ev') tags.push('新能源优先');
  if (form.preference === 'comfort') tags.push('舒适优先');
  if (form.preference === 'reliable') tags.push('稳定优先');

  return tags.slice(0, 4);
}

function buildResultCopyText(result, form) {
  const lines = [
    '【我的车型建议】',
    `目的地：${form.destination || '未填写'}`,
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
  ];

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

  lines.push('当前为免费轻量建议，主要帮你判断车型和能源大方向。具体车型、平台价格和补能路线，建议结合实际车源再确认。');
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
  const { tripProfile, primary, reasons, notRecommended, directions, energyAdvice, evScore } = result;
  const tags = buildTags(form, result.evRawScore);
  const [copyState, setCopyState] = useState('idle'); // idle | ok | fail

  const handleCopy = async () => {
    const text = buildResultCopyText(result, form);
    const ok = await copyToClipboard(text);
    setCopyState(ok ? 'ok' : 'fail');
    setTimeout(() => setCopyState('idle'), 3000);
  };

  return (
    <div className="grid gap-4">
      {/* 卡片 1：本次行程画像 */}
      <section className="rounded-[24px] bg-gradient-to-b from-[#356F67] to-[#4A8F83] p-5 text-white shadow-[0_12px_32px_rgba(34,82,71,0.12)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-white/65">本次行程画像</p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold">{t}</span>
              ))}
            </div>
          ) : null}
        </div>
        <h2 className="mt-2 text-xl font-bold">{tripProfile.destination}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <ProfileTag label="目的地类型" value={tripProfile.type} />
          <ProfileTag label="出行人数" value={tripProfile.people} />
          <ProfileTag label="行李" value={tripProfile.luggage} />
          <ProfileTag label="行程强度" value={tripProfile.intensity} />
        </div>
        <div className="mt-2">
          <ProfileTag label="用车偏好" value={tripProfile.preference} wide />
        </div>
      </section>

      {/* 卡片 2：推荐车型类型 */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">推荐车型类型</h2>
        </div>

        <div className="mt-3 rounded-2xl bg-mint/60 px-3 py-3 ring-1 ring-pine/10">
          <p className="text-xs font-bold text-muted">优先推荐</p>
          <p className="mt-1 text-[20px] font-bold leading-tight text-pine">{primary.category}</p>
          <p className="mt-1 text-sm font-medium text-ink">{primary.models}</p>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-aquaCard px-3 py-2.5">
          {energyAdvice.level === 'ev-friendly' || energyAdvice.level === 'recommend-extended' ? (
            <BatteryCharging size={16} className="mt-0.5 shrink-0 text-pine" />
          ) : (
            <Fuel size={16} className="mt-0.5 shrink-0 text-[#735B16]" />
          )}
          <div>
            <p className="text-xs font-bold text-muted">能源方向</p>
            <p className="text-sm font-bold text-ink">{energyAdvice.recommended}</p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs font-bold text-muted">推荐理由</p>
          <ul className="mt-2 grid gap-1.5">
            {reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 rounded-2xl bg-aquaCard/70 px-3 py-2 text-sm font-medium leading-relaxed text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {notRecommended.length > 0 ? (
          <div className="mt-3 rounded-2xl bg-coral/5 px-3 py-3 ring-1 ring-coral/10">
            <p className="text-xs font-bold text-coral">不太建议的车型方向</p>
            <ul className="mt-1.5 grid gap-1">
              {notRecommended.map((item) => (
                <li key={item} className="flex gap-1.5 text-sm font-medium leading-relaxed text-ink">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-coral" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* 卡片 3：能源类型建议 */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BatteryCharging size={20} className="text-pine" />
            <h2 className="text-lg font-bold text-ink">能源类型建议</h2>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${evScore.badge}`}>
            {evScore.level}
          </span>
        </div>

        <p className="mt-3 rounded-2xl bg-aquaCard px-3 py-2.5 text-sm font-medium leading-relaxed text-ink">
          {evScore.detail}
        </p>

        <div className="mt-3">
          <p className="text-xs font-bold text-muted">油车 / 纯电 / 增程 怎么选</p>
          <div className="mt-2 grid gap-2">
            {evScore.choices.map((choice) => (
              <div key={choice.type} className="flex gap-2 rounded-2xl bg-aquaCard/70 px-3 py-2.5">
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  choice.weight === '首选' || choice.weight === '推荐'
                    ? 'bg-mint text-pine'
                    : choice.weight === '可选'
                      ? 'bg-aquaCard text-pine ring-1 ring-pine/10'
                      : 'bg-coral/10 text-coral'
                }`}>{choice.weight}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{choice.type}</p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">{choice.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs font-medium leading-relaxed text-muted">
          以上为经验性参考，不保证某地一定能或不能充电。建议结合租车时看到的实际车型和当地充电站分布判断。
        </p>
      </section>

      {/* 卡片 4：适合租的车型方向 */}
      <section className="rounded-[24px] border border-pine/10 bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Car size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">适合租的车型方向</h2>
        </div>
        <p className="mt-1 text-xs font-medium leading-relaxed text-muted">
          只给大类方向，不做具体车型排行榜和平台推荐。
        </p>
        <div className="mt-3 grid gap-3">
          <DirectionBlock label="首选" tone="primary" items={directions.firstChoice} />
          {directions.alternatives.length > 0 ? (
            <DirectionBlock label="可选" tone="secondary" items={directions.alternatives} />
          ) : null}
          {directions.cautious.length > 0 ? (
            <DirectionBlock label="谨慎" tone="cautious" items={directions.cautious} />
          ) : null}
        </div>
      </section>

      {/* 卡片 5：下一步建议 */}
      <section className="rounded-[24px] border border-pine/10 bg-aquaCard p-4 shadow-card">
        <div className="flex items-center gap-2">
          <ArrowRight size={18} className="text-pine" />
          <h2 className="text-lg font-bold text-ink">下一步建议</h2>
        </div>

        <div className="mt-4 grid gap-2.5">
          <Link
            to="/budget"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#356F67] to-[#4A8F83] px-4 text-sm font-bold text-white shadow-lg shadow-pine/20"
          >
            去算这趟预算
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/price-compare"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-card px-4 text-sm font-bold text-pine ring-1 ring-pine/15"
          >
            对比两个租车方案
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            disabled={copyState !== 'idle'}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-card px-4 text-sm font-bold text-pine ring-1 ring-pine/15 disabled:opacity-70"
          >
            {copyState === 'ok' ? '已复制，也可以截图保存' : copyState === 'fail' ? '复制失败，可以长按或截图保存' : '保存这份建议'}
            <Copy size={16} />
          </button>
        </div>

        {copyState === 'ok' ? (
          <p className="mt-2 text-center text-xs font-bold text-pine">
            已复制建议摘要，内容包含目的地、推荐车型、新能源适配等级和核心建议。
          </p>
        ) : copyState === 'fail' ? (
          <p className="mt-2 text-center text-xs font-bold text-[#735B16]">
            复制未成功，可以长按屏幕选中文字后手动复制，或截图保存这份建议。
          </p>
        ) : null}
      </section>

      {/* 轻量版边界说明 */}
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

function ProfileTag({ label, value, wide }) {
  return (
    <div className={`rounded-2xl bg-white/12 px-3 py-2.5 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[11px] font-bold text-white/60">{label}</p>
      <p className="mt-0.5 text-sm font-bold leading-snug">{value}</p>
    </div>
  );
}

function DirectionBlock({ label, tone, items }) {
  const toneClass = {
    primary: 'border-pine/20 bg-mint/60',
    secondary: 'border-pine/10 bg-aquaCard',
    cautious: 'border-coral/15 bg-coral/5',
  }[tone] || 'bg-aquaCard';

  const labelClass = {
    primary: 'bg-pine text-white',
    secondary: 'bg-aquaCard text-pine ring-1 ring-pine/10',
    cautious: 'bg-coral/10 text-coral',
  }[tone] || 'bg-aquaCard text-pine';

  return (
    <div className={`rounded-2xl border px-3 py-3 ${toneClass}`}>
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${labelClass}`}>{label}</span>
      <ul className="mt-2 grid gap-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm font-medium leading-relaxed text-ink">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
