const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "输出");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function colName(index) {
  let name = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

const S = {
  normal: 0,
  title: 1,
  subtitle: 2,
  section: 3,
  header: 4,
  input: 5,
  calc: 6,
  border: 7,
  warning: 8,
  brand: 9,
  bold: 10,
  percent: 11,
  currencyInput: 12,
  currencyCalc: 13,
  currencyBold: 14,
  centerInput: 15,
  centerCalc: 16,
  redCalc: 17,
  note: 18,
};

function c(v, s = S.border) {
  return { v, s };
}

function f(formula, s = S.calc) {
  return { f: formula, s };
}

function empty(s = S.border) {
  return { v: "", s };
}

function cellXml(cell, rowIndex, colIndex, defaultStyle, sharedStrings) {
  const ref = `${colName(colIndex)}${rowIndex}`;
  const isObject = typeof cell === "object" && cell !== null;
  const style = isObject && cell.s != null ? cell.s : defaultStyle;
  const styleAttr = style != null ? ` s="${style}"` : "";

  if (isObject && Object.prototype.hasOwnProperty.call(cell, "f")) {
    return `<c r="${ref}"${styleAttr}><f>${xmlEscape(cell.f)}</f></c>`;
  }

  const value = isObject && Object.prototype.hasOwnProperty.call(cell, "v") ? cell.v : cell;
  if (value === "" || value == null) {
    return `<c r="${ref}"${styleAttr}/>`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"${styleAttr}><v>${value}</v></c>`;
  }
  const stringIndex = sharedStrings?.map.get(String(value));
  if (stringIndex != null) {
    return `<c r="${ref}"${styleAttr} t="s"><v>${stringIndex}</v></c>`;
  }
  return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
}

function dataValidationsXml(validations = []) {
  if (!validations.length) return "";
  const items = validations
    .map((dv) => {
      const allowBlank = dv.allowBlank === false ? "0" : "1";
      const errorTitle = dv.errorTitle || "请从下拉选项中选择";
      const error = dv.error || "该单元格仅支持预设选项。";
      return `<dataValidation type="${dv.type || "list"}" allowBlank="${allowBlank}" showErrorMessage="1" errorTitle="${xmlEscape(errorTitle)}" error="${xmlEscape(error)}" sqref="${xmlEscape(dv.range)}"><formula1>${xmlEscape(dv.formula1)}</formula1></dataValidation>`;
    })
    .join("");
  return `<dataValidations count="${validations.length}">${items}</dataValidations>`;
}

function conditionalFormattingXml(items = []) {
  return items
    .map((item, index) => {
      const priority = item.priority || index + 1;
      return `<conditionalFormatting sqref="${xmlEscape(item.range)}"><cfRule type="expression" dxfId="${item.dxfId || 0}" priority="${priority}"><formula>${xmlEscape(item.formula)}</formula></cfRule></conditionalFormatting>`;
    })
    .join("");
}

function worksheetXml(sheet, sharedStrings) {
  const rowCount = sheet.rows.length;
  const colCount = Math.max(sheet.widths?.length || 1, ...sheet.rows.map((row) => row.length));
  const ref = `A1:${colName(colCount)}${rowCount}`;
  const widths = sheet.widths || Array.from({ length: colCount }, () => 16);
  const cols = widths
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join("");
  const rowsXml = sheet.rows
    .map((row, rowIndex) => {
      const r = rowIndex + 1;
      const defaultStyle = sheet.defaultStyle ?? S.border;
      const height = sheet.rowHeights?.[r] || (r === 1 ? 34 : sheet.rowHeight || 28);
      const cells = row.map((cell, colIndex) => cellXml(cell, r, colIndex + 1, defaultStyle, sharedStrings)).join("");
      return `<row r="${r}" ht="${height}" customHeight="1">${cells}</row>`;
    })
    .join("");
  const freeze = sheet.freeze
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>`
    : `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;
  const autoFilter = sheet.autoFilter ? `<autoFilter ref="${sheet.autoFilter === true ? ref : sheet.autoFilter}"/>` : "";
  const mergeCells = sheet.merges?.length
    ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map((merge) => `<mergeCell ref="${merge}"/>`).join("")}</mergeCells>`
    : "";
  const conditionalFormats = conditionalFormattingXml(sheet.conditionalFormats);
  const validations = dataValidationsXml(sheet.validations);
  const orientation = sheet.orientation || "portrait";
  const fitHeight = sheet.fitToHeight == null ? 0 : sheet.fitToHeight;
  const fitWidth = sheet.fitToWidth == null ? 1 : sheet.fitToWidth;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
  <dimension ref="${ref}"/>
  ${freeze}
  <sheetFormatPr defaultRowHeight="${sheet.rowHeight || 28}"/>
  <cols>${cols}</cols>
  <sheetData>${rowsXml}</sheetData>
  ${autoFilter}
  ${mergeCells}
  ${conditionalFormats}
  ${validations}
  <printOptions horizontalCentered="1"/>
  <pageMargins left="0.35" right="0.35" top="0.55" bottom="0.55" header="0.2" footer="0.2"/>
  <pageSetup paperSize="9" orientation="${orientation}" fitToWidth="${fitWidth}" fitToHeight="${fitHeight}"/>
</worksheet>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="3">
    <numFmt numFmtId="164" formatCode="0.00%"/>
    <numFmt numFmtId="165" formatCode="¥#,##0"/>
    <numFmt numFmtId="166" formatCode="#,##0.00"/>
  </numFmts>
  <fonts count="8">
    <font><sz val="11"/><color rgb="FF263238"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="16"/><color rgb="FF1B6F6A"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FF1B6F6A"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FFB42318"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FFE25273"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FF263238"/><name val="Microsoft YaHei"/></font>
    <font><b/><sz val="11"/><color rgb="FF146C94"/><name val="Microsoft YaHei"/></font>
  </fonts>
  <fills count="10">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2C9A92"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF3C4"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDDF2FF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFE2E2"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE8F7F0"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF0F4"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF5F7F8"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD8E4E2"/></left>
      <right style="thin"><color rgb="FFD8E4E2"/></right>
      <top style="thin"><color rgb="FFD8E4E2"/></top>
      <bottom style="thin"><color rgb="FFD8E4E2"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="19">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="7" borderId="0" xfId="0" applyFont="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="6" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="8" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="6" fillId="7" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="164" fontId="7" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyFont="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="165" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="165" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="165" fontId="6" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyFont="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="9" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="2">
    <dxf><font><color rgb="FFB42318"/></font><fill><patternFill patternType="solid"><fgColor rgb="FFFFE2E2"/><bgColor indexed="64"/></patternFill></fill></dxf>
    <dxf><font><b/><color rgb="FFB42318"/></font><fill><patternFill patternType="solid"><fgColor rgb="FFFFE2E2"/><bgColor indexed="64"/></patternFill></fill></dxf>
  </dxfs>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
}

function collectSharedStrings(sheets) {
  const list = [];
  const map = new Map();
  function add(value) {
    const text = String(value);
    if (!map.has(text)) {
      map.set(text, list.length);
      list.push(text);
    }
  }
  for (const sheet of sheets) {
    for (const row of sheet.rows) {
      for (const cell of row) {
        const isObject = typeof cell === "object" && cell !== null;
        if (isObject && Object.prototype.hasOwnProperty.call(cell, "f")) continue;
        const value = isObject && Object.prototype.hasOwnProperty.call(cell, "v") ? cell.v : cell;
        if (typeof value === "string" && value !== "") add(value);
      }
    }
  }
  return { list, map };
}

function sharedStringsXml(sharedStrings) {
  const items = sharedStrings.list
    .map((text) => {
      const preserve = /^\s|\s$|\n/.test(text) ? ' xml:space="preserve"' : "";
      return `<si><t${preserve}>${xmlEscape(text)}</t></si>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.list.length}" uniqueCount="${sharedStrings.list.length}">${items}</sst>`;
}

function crc32(buffer) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let value = i;
      for (let k = 0; k < 8; k += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      table[i] = value >>> 0;
    }
    crc32.table = table;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function writeZip(files, dest) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, day } = dosDateTime();

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuffer, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuffer);
    offset += local.length + nameBuffer.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  fs.writeFileSync(dest, Buffer.concat([...localParts, ...centralParts, end]));
}

function workbookFiles(title, sheets) {
  const sharedStrings = collectSharedStrings(sheets);
  const sheetOverrides = sheets
    .map((_, index) => `  <Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    .join("\n");
  const workbookSheets = sheets
    .map((sheet, index) => `    <sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join("\n");
  const rels = sheets
    .map((_, index) => `  <Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`)
    .join("\n");
  const titles = sheets.map((sheet) => `<vt:lpstr>${xmlEscape(sheet.name)}</vt:lpstr>`).join("");
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const files = [
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
${sheetOverrides}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
${workbookSheets}
  </sheets>
  <calcPr calcId="0" fullCalcOnLoad="1" forceFullCalc="1"/>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId${sheets.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`,
    },
    { name: "xl/styles.xml", data: stylesXml() },
    { name: "xl/sharedStrings.xml", data: sharedStringsXml(sharedStrings) },
    ...sheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, data: worksheetXml(sheet, sharedStrings) })),
    {
      name: "docProps/core.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${xmlEscape(title)}</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: "docProps/app.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheets.length}</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="${sheets.length}" baseType="lpstr">${titles}</vt:vector></TitlesOfParts>
  <Company/>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`,
    },
  ];
  return files;
}

function writeWorkbook(fileName, title, sheets) {
  ensureDir(outDir);
  writeZip(workbookFiles(title, sheets), path.join(outDir, fileName));
}

function buildChecklistRows() {
  const rows = [[c("模块", S.header), c("检查项", S.header), c("是否完成", S.header), c("风险等级", S.header), c("拍照/确认建议", S.header), c("备注", S.header)]];
  const moduleAdvice = {
    取车前确认: "截图保存订单、合同、客服/门店沟通记录。",
    车身外观检查: "远景+近景拍照，划痕/凹陷处要拍清楚并让门店标注。",
    轮胎轮毂检查: "拍胎面、胎侧、轮毂外圈，破损或鼓包要当场确认。",
    车内功能检查: "拍仪表盘和功能状态，异常最好录一段短视频。",
    随车证件与工具: "确认是否在车内，缺失要在取车单/聊天记录里备注。",
    保险与费用确认: "截图保险条款和费用规则，不清楚的当场问清责任边界。",
    还车前确认: "还车前后各拍一次，保留还车凭证和费用确认记录。",
  };
  const groups = [
    {
      module: "取车前确认",
      items: [
        ["核对订单车型、车牌、取还车时间", "高"],
        ["确认取车门店/交车地点", "中"],
        ["确认车辆押金金额", "高"],
        ["确认违章押金金额", "高"],
        ["确认押金退还时间", "高"],
        ["确认是否需要信用卡/芝麻信用", "中"],
        ["确认是否限制里程", "高"],
        ["确认超里程收费规则", "高"],
        ["确认是否支持异地还车", "高"],
        ["确认异地还车费", "高"],
        ["确认还车油量/电量要求", "高"],
        ["保存平台订单和客服联系方式", "中"],
      ],
    },
    {
      module: "车身外观检查",
      items: [
        ["前保险杠", "高"],
        ["后保险杠", "高"],
        ["左前门、左后门", "中"],
        ["右前门、右后门", "中"],
        ["前后翼子板", "中"],
        ["发动机盖/前机盖", "中"],
        ["后备厢盖", "中"],
        ["车顶", "中"],
        ["前挡风玻璃", "高"],
        ["四个车窗玻璃", "高"],
        ["后视镜", "中"],
        ["底盘可见区域", "高"],
      ],
    },
    {
      module: "轮胎轮毂检查",
      items: [
        ["左前轮轮胎", "高"],
        ["右前轮轮胎", "高"],
        ["左后轮轮胎", "高"],
        ["右后轮轮胎", "高"],
        ["左前轮轮毂", "高"],
        ["右前轮轮毂", "高"],
        ["左后轮轮毂", "高"],
        ["右后轮轮毂", "高"],
        ["胎压是否正常", "高"],
        ["是否有备胎", "中"],
        ["是否有补胎液/充气泵", "中"],
      ],
    },
    {
      module: "车内功能检查",
      items: [
        ["当前油量/电量", "高"],
        ["当前总里程", "高"],
        ["仪表盘是否有故障灯", "高"],
        ["空调制冷/制热", "中"],
        ["车机导航", "低"],
        ["倒车影像", "中"],
        ["前后雷达", "中"],
        ["大灯、转向灯、刹车灯", "高"],
        ["雨刷", "中"],
        ["喇叭", "中"],
        ["车窗升降", "中"],
        ["座椅调节", "低"],
        ["安全带", "高"],
        ["后备厢开关", "低"],
        ["USB/Type-C 充电口", "低"],
        ["蓝牙/CarPlay/HiCar", "低"],
        ["天窗/遮阳帘", "低"],
      ],
    },
    {
      module: "随车证件与工具",
      items: [
        ["行驶证", "高"],
        ["车辆保险信息", "高"],
        ["三角警示牌", "中"],
        ["反光背心", "中"],
        ["备胎", "中"],
        ["千斤顶", "中"],
        ["补胎液/充气泵", "中"],
        ["充电线/转接头", "中"],
        ["ETC", "低"],
        ["备用钥匙", "低"],
      ],
    },
    {
      module: "保险与费用确认",
      items: [
        ["基础保险包含哪些项目", "高"],
        ["是否购买补充保险", "中"],
        ["是否有不计免赔", "高"],
        ["起赔金额是多少", "高"],
        ["轮胎轮毂是否赔付", "高"],
        ["玻璃单独破损是否赔付", "高"],
        ["底盘损伤是否赔付", "高"],
        ["涉水是否赔付", "高"],
        ["道路救援是否免费", "中"],
        ["出险后先联系谁", "高"],
        ["是否需要现场报案", "高"],
        ["违章如何处理", "中"],
        ["还车超时如何收费", "中"],
      ],
    },
    {
      module: "还车前确认",
      items: [
        ["油量/电量是否达到要求", "高"],
        ["车内个人物品是否带走", "中"],
        ["车内垃圾是否清理", "低"],
        ["是否拍摄还车视频", "高"],
        ["是否拍摄油量/电量和里程", "高"],
        ["是否现场确认验车结果", "高"],
        ["是否拿到还车凭证", "高"],
        ["是否确认押金退还时间", "高"],
        ["是否确认是否有额外扣费", "高"],
      ],
    },
  ];

  for (const group of groups) {
    for (const [item, risk] of group.items) {
      rows.push([
        c(group.module, S.border),
        c(item, S.border),
        c("未检查", S.centerInput),
        c(risk, risk === "高" ? S.warning : S.centerCalc),
        c(moduleAdvice[group.module], S.border),
        empty(S.input),
      ]);
    }
  }
  rows.push([c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand)]);
  return rows;
}

function buildChecklistWorkbook() {
  const checklistRows = buildChecklistRows();
  const lastChecklistRow = checklistRows.length - 1;
  const photoItems = [
    ["绕车一圈视频", "从车头开始顺时针，车牌、四角、两侧都入镜", "取车/还车"],
    ["前保险杠", "拍正面和左右角，已有刮痕要近景", "取车"],
    ["后保险杠", "拍正面和左右角，注意倒车痕迹", "取车"],
    ["左侧车身", "车门、翼子板、下裙边连贯拍摄", "取车"],
    ["右侧车身", "车门、翼子板、下裙边连贯拍摄", "取车"],
    ["四个轮胎", "胎面、胎侧、鼓包/裂纹单独拍", "取车"],
    ["四个轮毂", "轮毂外圈划伤和缺口近景拍", "取车"],
    ["前挡风玻璃", "逆光看裂纹和小坑，必要时近景", "取车"],
    ["后备厢", "拍内部、盖板、随车工具位置", "取车"],
    ["车顶", "举高手机扫一遍，SUV/MPV尤其注意", "取车"],
    ["底盘可见区域", "车头、车尾、侧边能看到的区域拍清楚", "取车"],
    ["仪表盘油量/电量", "拍清油量/电量和续航显示", "取车/还车"],
    ["当前总里程", "里程数字要清晰，避免反光", "取车/还车"],
    ["故障灯状态", "车辆通电后拍仪表盘状态", "取车"],
    ["还车时车辆一圈视频", "还车前绕车一圈，环境和车牌入镜", "还车"],
    ["还车时仪表盘", "油量/电量、总里程、故障灯同框", "还车"],
  ];

  const sheets = [
    {
      name: "使用说明",
      rows: [
        [c("《第一次租车自驾取车验车清单》", S.title), empty(S.title), empty(S.title), empty(S.title), empty(S.title), empty(S.title)],
        [c("适合机场、高铁站、门店取车时使用，建议取车前、取车时、还车前都看一遍。", S.subtitle), empty(S.subtitle), empty(S.subtitle), empty(S.subtitle), empty(S.subtitle), empty(S.subtitle)],
        [c("使用步骤", S.section), empty(S.section), empty(S.section), empty(S.section), empty(S.section), empty(S.section)],
        [c("1", S.centerCalc), c("取车前先确认订单、押金、保险、还车要求。", S.border), empty(), empty(), empty(), empty()],
        [c("2", S.centerCalc), c("取车时按清单逐项检查。", S.border), empty(), empty(), empty(), empty()],
        [c("3", S.centerCalc), c("重点拍摄车身一圈视频、轮胎轮毂、玻璃、底盘、仪表盘。", S.border), empty(), empty(), empty(), empty()],
        [c("4", S.centerCalc), c("还车前再次拍摄车辆状态。", S.border), empty(), empty(), empty(), empty()],
        [c("5", S.centerCalc), c("保留平台订单、聊天记录、还车凭证。", S.border), empty(), empty(), empty(), empty()],
        [c("免责声明", S.section), c("本清单仅供租车自驾参考，具体责任以租车平台、门店和合同约定为准。", S.border), empty(), empty(), empty(), empty()],
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [10, 30, 18, 18, 18, 18],
      merges: ["A1:F1", "A2:F2", "A3:F3", "B4:F4", "B5:F5", "B6:F6", "B7:F7", "B8:F8", "B9:F9", "A10:F10"],
      rowHeight: 34,
      freeze: true,
      fitToHeight: 1,
    },
    {
      name: "取车验车清单",
      rows: checklistRows,
      widths: [17, 26, 13, 12, 44, 24],
      freeze: true,
      autoFilter: `A1:F${lastChecklistRow}`,
      validations: [
        { range: `C2:C${lastChecklistRow}`, formula1: '"未检查,已完成,不适用"' },
        { range: `D2:D${lastChecklistRow}`, formula1: '"高,中,低"' },
      ],
      conditionalFormats: [{ range: `A2:F${lastChecklistRow}`, formula: '$D2="高"', dxfId: 0 }],
      rowHeight: 38,
    },
    {
      name: "验车完成度",
      rows: [
        [c("验车完成度自动统计", S.title), empty(S.title), empty(S.title), empty(S.title)],
        [c("统计项", S.header), c("结果", S.header), c("说明", S.header), c("建议动作", S.header)],
        [c("总检查项数量", S.border), f(`COUNTA('取车验车清单'!B2:B${lastChecklistRow})`, S.calc), c("清单内全部检查项数量", S.note), c("取车前先看一遍全表", S.note)],
        [c("已完成数量", S.border), f(`COUNTIF('取车验车清单'!C2:C${lastChecklistRow},"已完成")`, S.calc), c("状态选择“已完成”的数量", S.note), c("越接近总数越安心", S.note)],
        [c("未检查数量", S.border), f(`COUNTIF('取车验车清单'!C2:C${lastChecklistRow},"未检查")`, S.calc), c("还没有检查的数量", S.note), c("优先处理高风险项", S.note)],
        [c("不适用数量", S.border), f(`COUNTIF('取车验车清单'!C2:C${lastChecklistRow},"不适用")`, S.calc), c("本次用不到的项目", S.note), c("例如新能源车没有备胎可标不适用", S.note)],
        [c("高风险未完成数量", S.border), f(`COUNTIFS('取车验车清单'!D2:D${lastChecklistRow},"高",'取车验车清单'!C2:C${lastChecklistRow},"未检查")`, S.redCalc), c("高风险项仍为“未检查”的数量", S.note), c("只要大于 0，就先别急着确认取车", S.note)],
        [c("完成度百分比", S.border), f("IFERROR(B4/(B3-B6),0)", S.percent), c("已完成数量 /（总数 - 不适用）", S.note), c("建议达到 90% 以上", S.note)],
        [c("风险等级判断", S.border), f('IF(OR(B8<70%,B7>0),"高风险，请先补充关键检查项",IF(B8>=90%,"低风险，可以取车/还车","中风险，建议补充检查"))', S.redCalc), c("按完成度和高风险未完成数量自动判断", S.note), c("红色提示时先补拍/补确认", S.note)],
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [22, 24, 38, 38],
      merges: ["A1:D1", "A10:D10"],
      freeze: true,
      conditionalFormats: [{ range: "B9:B9", formula: 'LEFT(B9,3)="高风险"', dxfId: 1 }],
      rowHeight: 34,
      fitToHeight: 1,
    },
    {
      name: "拍照模板",
      rows: [
        [c("拍摄内容", S.header), c("建议拍摄方式", S.header), c("使用时机", S.header), c("是否完成", S.header), c("备注", S.header)],
        ...photoItems.map((item) => [c(item[0]), c(item[1]), c(item[2], S.centerCalc), c("未检查", S.centerInput), empty(S.input)]),
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [24, 46, 14, 13, 24],
      freeze: true,
      autoFilter: `A1:E${photoItems.length + 1}`,
      validations: [{ range: `D2:D${photoItems.length + 1}`, formula1: '"未检查,已完成,不适用"' }],
      rowHeight: 38,
    },
    {
      name: "PDF导出建议版式",
      rows: [
        [c("PDF 导出建议版式", S.title), empty(S.title), empty(S.title), empty(S.title)],
        [c("适合用途", S.section), c("小红书笔记预览图、粉丝领取前试看、私信自动回复附件说明。", S.border), empty(), empty()],
        [c("推荐导出范围", S.section), c("使用说明、验车完成度、拍照模板可做预览；完整领取版建议包含全部 Sheet。", S.border), empty(), empty()],
        [c("页面设置", S.section), c("A4 竖向；页边距选“窄”；缩放选“将所有列调整为一页”；清单页允许多页。", S.border), empty(), empty()],
        [c("截图建议", S.section), c("手机截图优先截：标题区、完成度统计区、拍照模板前 10 项；清单长表可导出 PDF 展示。", S.border), empty(), empty()],
        [c("品牌露出", S.section), c("导出前把底部“小红书 @你的账号名”替换为你的真实账号。", S.warning), empty(), empty()],
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [20, 68, 12, 12],
      merges: ["A1:D1", "B2:D2", "B3:D3", "B4:D4", "B5:D5", "B6:D6", "A7:D7"],
      freeze: true,
      fitToHeight: 1,
    },
  ];
  writeWorkbook("第一次租车自驾取车验车清单.xlsx", "第一次租车自驾取车验车清单", sheets);
}

function buildBudgetFillSheet() {
  const rows = [];
  rows.push([c("《自驾旅行预算测算表》", S.title), empty(S.title), empty(S.title), empty(S.title), empty(S.title)]);
  rows.push([c("区域 A：基础信息", S.section), empty(S.section), empty(S.section), empty(S.section), empty(S.section)]);
  rows.push([c("目的地"), empty(S.input), c("例：新疆伊犁 / 青岛 / 川西", S.note), empty(), empty()]);
  rows.push([c("出发城市"), empty(S.input), c("例：重庆 / 成都 / 上海", S.note), empty(), empty()]);
  rows.push([c("出行天数"), empty(S.input), c("填写数字", S.note), empty(), empty()]);
  rows.push([c("出行人数"), empty(S.input), c("填写数字", S.note), empty(), empty()]);
  rows.push([c("租车天数"), empty(S.input), c("填写数字", S.note), empty(), empty()]);
  rows.push([c("预计总里程/km"), empty(S.input), c("填写预计自驾总里程", S.note), empty(), empty()]);
  rows.push([c("能源类型"), c("油车", S.input), c("下拉选择：油车 / 新能源 / 混动", S.note), empty(), empty()]);
  rows.push([c("百公里油耗/L"), empty(S.input), c("油车/混动填写", S.note), empty(), empty()]);
  rows.push([c("百公里电耗/kWh"), empty(S.input), c("新能源填写", S.note), empty(), empty()]);
  rows.push([c("油价/元每升"), empty(S.input), c("当地预计油价", S.note), empty(), empty()]);
  rows.push([c("电价/元每度"), empty(S.input), c("快充/慢充可取平均值", S.note), empty(), empty()]);
  rows.push([c("出行预算风格"), c("适中", S.input), c("下拉选择：省钱 / 适中 / 舒适", S.note), empty(), empty()]);
  rows.push([empty(S.note), empty(S.note), empty(S.note), empty(S.note), empty(S.note)]);

  function section(title) {
    const sectionRow = rows.length + 1;
    rows.push([c(title, S.section), empty(S.section), empty(S.section), empty(S.section), empty(S.section)]);
    rows.push([c("费用项目", S.header), c("单价", S.header), c("数量", S.header), c("小计", S.header), c("备注", S.header)]);
    return sectionRow;
  }

  const vehicleSectionRow = section("区域 B：车辆与交通费用");
  const vehicleStart = rows.length + 1;
  const vehicleRows = [
    ["租车日租金", S.currencyInput, f("$B$7", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "单价 × 租车天数"],
    ["基础服务费", S.currencyInput, f("$B$7", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "可按天填写，如平台另收服务费"],
    ["基础保险", S.currencyInput, f("$B$7", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "单价 × 租车天数"],
    ["补充保险", S.currencyInput, f("$B$7", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "单价 × 租车天数"],
    ["异地还车费", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "如无异地还车填 0"],
    ["油费/电费", f('IF($B$9="新能源",$B$13,$B$12)', S.currencyCalc), f('IF($B$9="新能源",$B$8/100*$B$11,$B$8/100*$B$10)', S.calc), () => f('IF($B$9="新能源",$B$8/100*$B$11*$B$13,$B$8/100*$B$10*$B$12)', S.currencyCalc), "根据能源类型自动估算"],
    ["高速费/过路费", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "可填预计总额"],
    ["停车费", S.currencyInput, f("$B$5", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "可按每天全车费用"],
    ["洗车费", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "还车前如需洗车"],
    ["车辆押金", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "不计入旅行总预算，计入临时占用资金"],
    ["违章押金", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "不计入旅行总预算，计入临时占用资金"],
  ];
  for (const item of vehicleRows) {
    const r = rows.length + 1;
    const unit = typeof item[1] === "number" ? empty(item[1]) : item[1];
    const qty = item[2];
    rows.push([c(item[0]), unit, qty, item[3](r), c(item[4], S.note)]);
  }
  const vehicleEnd = rows.length;

  const stayFoodSectionRow = section("区域 C：住宿餐饮费用");
  const stayFoodStart = rows.length + 1;
  const stayFoodRows = [
    ["酒店/民宿每晚总价", S.currencyInput, f("MAX($B$5-1,0)", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "住宿费用 = 每晚总价 ×（出行天数 - 1）"],
    ["早餐", S.currencyInput, f("$B$6*$B$5", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "人均单价 × 人数 × 天数"],
    ["午餐", S.currencyInput, f("$B$6*$B$5", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "人均单价 × 人数 × 天数"],
    ["晚餐", S.currencyInput, f("$B$6*$B$5", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "人均单价 × 人数 × 天数"],
    ["零食饮料", S.currencyInput, f("$B$5", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "按每日全车费用计算"],
    ["咖啡奶茶", S.currencyInput, f("$B$6*$B$5", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "可按人均每天估算"],
    ["特色餐/大餐", S.currencyInput, empty(S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "单次全车费用 × 次数"],
  ];
  for (const item of stayFoodRows) {
    const r = rows.length + 1;
    rows.push([c(item[0]), empty(item[1]), item[2], item[3](r), c(item[4], S.note)]);
  }
  const stayFoodEnd = rows.length;

  const scenicSectionRow = section("区域 D：景区游玩费用");
  const scenicStart = rows.length + 1;
  const scenicRows = [
    ["景区门票", S.currencyInput, f("$B$6", S.centerCalc), "人均门票 × 人数"],
    ["景区区间车", S.currencyInput, f("$B$6", S.centerCalc), "人均区间车 × 人数"],
    ["景区停车费", S.currencyInput, empty(S.centerInput), "单次/单景区停车费 × 次数"],
    ["索道/缆车", S.currencyInput, f("$B$6", S.centerCalc), "人均费用 × 人数"],
    ["旅拍/写真", S.currencyInput, c(1, S.centerInput), "按总价或套餐数填写"],
    ["骑马/娱乐项目", S.currencyInput, empty(S.centerInput), "人均/单次费用 × 人数或次数"],
    ["导游/讲解", S.currencyInput, c(1, S.centerInput), "按团队总价填写"],
    ["装备租赁", S.currencyInput, empty(S.centerInput), "可按人次或天数填写"],
  ];
  for (const item of scenicRows) {
    const r = rows.length + 1;
    rows.push([c(item[0]), empty(item[1]), item[2], f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), c(item[3], S.note)]);
  }
  const scenicEnd = rows.length;

  const otherSectionRow = section("区域 E：其他费用");
  const otherStart = rows.length + 1;
  const otherRows = [
    ["往返机票/高铁", S.currencyInput, f("$B$6", S.centerCalc), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "人均单价 × 出行人数"],
    ["市内打车/公交", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "出发地/目的地市内交通"],
    ["购物/伴手礼", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "按总预算填写"],
    ["药品/防晒/装备", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "高原/海边/亲子建议预留"],
    ["电话流量/充电宝", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "可按总价填写"],
    ["其他备注费用", S.currencyInput, c(1, S.centerInput), (r) => f(`IF(OR(B${r}="",C${r}=""),"",B${r}*C${r})`, S.currencyCalc), "临时想到的费用放这里"],
  ];
  for (const item of otherRows) {
    const r = rows.length + 1;
    rows.push([c(item[0]), empty(item[1]), item[2], item[3](r), c(item[4], S.note)]);
  }
  const emergencyRow = rows.length + 1;
  rows.push([
    c("应急预算"),
    empty(S.currencyCalc),
    c("10%", S.centerCalc),
    f(`(SUM(D${vehicleStart}:D${vehicleEnd - 2})+SUM(D${stayFoodStart}:D${stayFoodEnd})+SUM(D${scenicStart}:D${scenicEnd})+SUM(D${otherStart}:D${emergencyRow - 1}))*10%`, S.currencyCalc),
    c("除押金外基础总预算 × 10%", S.note),
  ]);
  rows.push([c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand)]);
  const brandRow = rows.length;

  return {
    sheet: {
      name: "预算填写表",
      rows,
      widths: [24, 16, 16, 18, 42],
      merges: [
        "A1:E1",
        "A2:E2",
        `A${vehicleSectionRow}:E${vehicleSectionRow}`,
        `A${stayFoodSectionRow}:E${stayFoodSectionRow}`,
        `A${scenicSectionRow}:E${scenicSectionRow}`,
        `A${otherSectionRow}:E${otherSectionRow}`,
        `A${brandRow}:E${brandRow}`,
      ],
      freeze: true,
      validations: [
        { range: "B9:B9", formula1: '"油车,新能源,混动"' },
        { range: "B14:B14", formula1: '"省钱,适中,舒适"' },
      ],
      conditionalFormats: [{ range: `A${emergencyRow}:E${emergencyRow}`, formula: `$D${emergencyRow}>0`, dxfId: 0 }],
      rowHeight: 30,
      fitToHeight: 0,
    },
    refs: { vehicleStart, vehicleEnd, stayFoodStart, stayFoodEnd, scenicStart, scenicEnd, otherStart, emergencyRow },
  };
}

function buildBudgetWorkbook() {
  const { sheet: fillSheet, refs } = buildBudgetFillSheet();
  const vehicleActual = `SUM('预算填写表'!D${refs.vehicleStart}:D${refs.vehicleEnd - 2})`;
  const deposit = `SUM('预算填写表'!D${refs.vehicleEnd - 1}:D${refs.vehicleEnd})`;
  const stay = `'预算填写表'!D${refs.stayFoodStart}`;
  const food = `SUM('预算填写表'!D${refs.stayFoodStart + 1}:D${refs.stayFoodEnd})`;
  const scenic = `SUM('预算填写表'!D${refs.scenicStart}:D${refs.scenicEnd})`;
  const bigTraffic = `'预算填写表'!D${refs.otherStart}`;
  const other = `SUM('预算填写表'!D${refs.otherStart + 1}:D${refs.emergencyRow - 1})`;
  const emergency = `'预算填写表'!D${refs.emergencyRow}`;

  const exampleRows = [
    [c("《自驾旅行预算测算表》示例预算：新疆伊犁 6 天 2 人", S.title), empty(S.title), empty(S.title), empty(S.title), empty(S.title)],
    [c("基础信息", S.section), empty(S.section), empty(S.section), empty(S.section), empty(S.section)],
    [c("目的地"), c("新疆伊犁", S.input), c("出发城市"), c("重庆", S.input), empty()],
    [c("出行天数"), c(6, S.input), c("出行人数"), c(2, S.input), empty()],
    [c("租车天数"), c(6, S.input), c("预计总里程/km"), c(1600, S.input), empty()],
    [c("能源类型"), c("油车", S.input), c("百公里油耗/L"), c(9, S.input), empty()],
    [c("油价/元每升"), c(8, S.input), empty(), empty(), empty()],
    [empty(S.note), empty(S.note), empty(S.note), empty(S.note), empty(S.note)],
    [c("费用项目", S.header), c("单价", S.header), c("数量", S.header), c("小计", S.header), c("备注", S.header)],
  ];
  const exampleItems = [
    ["租车日租金", 400, 6, "租车日租金 × 租车天数"],
    ["基础保险", 50, 6, "50 元/天"],
    ["补充保险", 80, 6, "80 元/天"],
    ["油费", "", "", "1600/100 × 9L × 8元"],
    ["高速费/过路费", 500, 1, "预计总额"],
    ["停车费", 20, 6, "20 元/天"],
    ["酒店每晚总价", 350, 5, "6 天行程住 5 晚"],
    ["早餐", 20, 12, "20 元/人/天 × 2 人 × 6 天"],
    ["午餐", 40, 12, "40 元/人/天 × 2 人 × 6 天"],
    ["晚餐", 70, 12, "70 元/人/天 × 2 人 × 6 天"],
    ["景区门票和区间车合计", 600, 2, "600 元/人"],
    ["往返机票", 1800, 2, "1800 元/人"],
  ];
  for (const item of exampleItems) {
    const row = exampleRows.length + 1;
    const subtotal = item[0] === "油费" ? f("1600/100*9*8", S.currencyCalc) : f(`B${row}*C${row}`, S.currencyCalc);
    exampleRows.push([c(item[0]), item[1] === "" ? empty(S.currencyCalc) : c(item[1], S.currencyInput), item[2] === "" ? empty(S.centerCalc) : c(item[2], S.centerInput), subtotal, c(item[3], S.note)]);
  }
  const emergencyExampleRow = exampleRows.length + 1;
  exampleRows.push([c("应急预算"), empty(S.currencyCalc), c("10%", S.centerCalc), f(`SUM(D10:D${emergencyExampleRow - 1})*10%`, S.currencyCalc), c("自动计算", S.note)]);
  const totalExampleRow = exampleRows.length + 1;
  exampleRows.push([c("示例旅行总预算", S.bold), empty(), empty(), f(`SUM(D10:D${emergencyExampleRow})`, S.currencyBold), c("不含租车押金/违章押金", S.note)]);
  exampleRows.push([c("示例人均预算", S.bold), empty(), empty(), f(`D${totalExampleRow}/2`, S.currencyBold), c("总预算 / 2 人", S.note)]);
  exampleRows.push([c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand)]);
  const exampleBrandRow = exampleRows.length;

  const sheets = [
    {
      name: "使用说明",
      rows: [
        [c("《自驾旅行预算测算表》", S.title), empty(S.title), empty(S.title), empty(S.title), empty(S.title)],
        [c("填写目的地、天数、人数、里程、车型、住宿、餐饮、门票等信息后，可自动估算旅行总预算、人均预算、日均预算、车辆成本占比和出行前建议准备资金。", S.subtitle), empty(S.subtitle), empty(S.subtitle), empty(S.subtitle), empty(S.subtitle)],
        [c("使用步骤", S.section), empty(S.section), empty(S.section), empty(S.section), empty(S.section)],
        [c("1", S.centerCalc), c("先填写基础信息。"), empty(), empty(), empty()],
        [c("2", S.centerCalc), c("再填写车辆与交通费用。"), empty(), empty(), empty()],
        [c("3", S.centerCalc), c("继续填写住宿、餐饮、景区游玩和其他费用。"), empty(), empty(), empty()],
        [c("4", S.centerCalc), c("查看总预算汇总和智能提示。"), empty(), empty(), empty()],
        [c("5", S.centerCalc), c("根据预算结果调整车型、住宿、路线或游玩项目。"), empty(), empty(), empty()],
        [c("说明", S.section), c("押金不计入实际花费，但会计入“出行前建议准备资金”。"), empty(), empty(), empty()],
        [c("免责声明", S.section), c("预算仅供参考，实际费用以租车平台、酒店、景区、油价、电价和当地情况为准。"), empty(), empty(), empty()],
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [10, 54, 14, 14, 14],
      merges: ["A1:E1", "A2:E2", "A3:E3", "B4:E4", "B5:E5", "B6:E6", "B7:E7", "B8:E8", "B9:E9", "B10:E10", "A11:E11"],
      freeze: true,
      rowHeight: 34,
      fitToHeight: 1,
    },
    fillSheet,
    {
      name: "总预算汇总",
      rows: [
        [c("总预算汇总", S.title), empty(S.title), empty(S.title)],
        [c("汇总项", S.header), c("金额", S.header), c("说明", S.header)],
        [c("车辆与交通实际费用"), f(vehicleActual, S.currencyCalc), c("不包含车辆押金和违章押金", S.note)],
        [c("住宿费用"), f(stay, S.currencyCalc), c("酒店/民宿每晚总价 × 晚数", S.note)],
        [c("餐饮费用"), f(food, S.currencyCalc), c("早餐、午餐、晚餐、零食、咖啡、特色餐", S.note)],
        [c("景区游玩费用"), f(scenic, S.currencyCalc), c("门票、区间车、索道、娱乐项目等", S.note)],
        [c("大交通费用"), f(bigTraffic, S.currencyCalc), c("往返机票/高铁", S.note)],
        [c("其他费用"), f(other, S.currencyCalc), c("市内交通、购物、装备、流量等", S.note)],
        [c("应急预算"), f(emergency, S.currencyCalc), c("除押金外基础总预算 × 10%", S.note)],
        [c("旅行总预算", S.bold), f("SUM(B3:B9)", S.currencyBold), c("所有实际花费合计，不含押金", S.note)],
        [c("人均预算", S.bold), f("IFERROR(B10/'预算填写表'!B6,0)", S.currencyBold), c("旅行总预算 / 出行人数", S.note)],
        [c("日均预算", S.bold), f("IFERROR(B10/'预算填写表'!B5,0)", S.currencyBold), c("旅行总预算 / 出行天数", S.note)],
        [c("人均日预算", S.bold), f("IFERROR(B10/'预算填写表'!B6/'预算填写表'!B5,0)", S.currencyBold), c("旅行总预算 / 人数 / 天数", S.note)],
        [c("临时占用资金", S.bold), f(deposit, S.currencyBold), c("车辆押金 + 违章押金", S.note)],
        [c("出行前建议准备资金", S.bold), f("B10+B14", S.currencyBold), c("旅行总预算 + 临时占用资金", S.note)],
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [26, 20, 48],
      merges: ["A1:C1", "A16:C16"],
      freeze: true,
      rowHeight: 32,
      fitToHeight: 1,
    },
    {
      name: "智能预算判断",
      rows: [
        [c("智能预算判断", S.title), empty(S.title), empty(S.title)],
        [c("判断项", S.header), c("结果", S.header), c("说明", S.header)],
        [c("人均预算等级"), f('IF(\'总预算汇总\'!B11<2000,"经济型",IF(\'总预算汇总\'!B11<5000,"适中型",IF(\'总预算汇总\'!B11<8000,"舒适型","高预算型")))', S.calc), c("按人均预算自动分层", S.note)],
        [c("车辆成本占比"), f("IFERROR('总预算汇总'!B3/'总预算汇总'!B10,0)", S.percent), c("车辆与交通实际费用 / 旅行总预算", S.note)],
        [c("车辆成本判断"), f('IF(B4<30%,"车辆成本合理",IF(B4<45%,"车辆成本偏高，但可接受","车辆成本较高，建议降低车型等级、减少租车天数或避免异地还车"))', S.calc), c("超过 45% 时建议重点优化车辆成本", S.note)],
        [c("预算优化建议：车辆"), f('IF(B4>=30%,"建议降低车型等级、避开节假日、减少异地还车或提前预订。","车辆成本占比正常，可继续对比车型和保险。")', S.calc), c("车辆成本偏高时自动提示", S.note)],
        [c("预算优化建议：住宿"), f('IFERROR(IF(\'总预算汇总\'!B4/\'总预算汇总\'!B10>=35%,"建议提前订房、错峰出行、选择县城或非核心景区住宿。","住宿费用占比正常。"),"住宿费用占比正常。")', S.calc), c("住宿占比高时自动提示", S.note)],
        [c("预算优化建议：景区"), f('IFERROR(IF(\'总预算汇总\'!B6/\'总预算汇总\'!B10>=20%,"建议提前确认门票、区间车、索道等费用，避免现场超预算。","景区游玩费用占比正常。"),"景区游玩费用占比正常。")', S.calc), c("景区费用较高时自动提示", S.note)],
        [c("新能源长里程提醒"), f('IF(AND(\'预算填写表\'!B9="新能源",\'预算填写表\'!B8>=800),"建议提前规划充电节点，预留补能时间。","当前无需额外新能源长里程提醒。")', S.calc), c("新能源且总里程较高时自动提示", S.note)],
        [c("适合的出行风格"), f('IF(\'总预算汇总\'!B11<2000,"适合学生党/轻预算路线，优先控制住宿和车型。",IF(\'总预算汇总\'!B11<5000,"适合情侣/朋友常规自驾，预算弹性较好。",IF(\'总预算汇总\'!B11<8000,"适合舒适型路线，可提升住宿或车型。","适合高预算深度游，建议重点确认保险和应急资金。")))', S.calc), c("结合人均预算给出路线风格参考", S.note)],
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [28, 60, 36],
      merges: ["A1:C1", "A11:C11"],
      freeze: true,
      conditionalFormats: [
        { range: "B3:B5", formula: 'OR(B3="高预算型",LEFT(B5,6)="车辆成本较高")', dxfId: 1 },
      ],
      rowHeight: 34,
      fitToHeight: 1,
    },
    {
      name: "示例预算",
      rows: exampleRows,
      widths: [26, 16, 16, 18, 48],
      merges: ["A1:E1", "A2:E2", `A${exampleBrandRow}:E${exampleBrandRow}`],
      freeze: true,
      autoFilter: "A9:E22",
      rowHeight: 32,
      fitToHeight: 1,
    },
    {
      name: "PDF导出建议版式",
      rows: [
        [c("PDF 导出建议版式", S.title), empty(S.title), empty(S.title), empty(S.title)],
        [c("推荐导出范围", S.section), c("使用说明 + 总预算汇总 + 智能预算判断 + 示例预算，可做领取前预览；完整版包含预算填写表。"), empty(), empty()],
        [c("页面设置", S.section), c("A4 竖向；页边距选“窄”；缩放选“将所有列调整为一页”；预算填写表允许多页。"), empty(), empty()],
        [c("预览顺序", S.section), c("第 1 页放使用说明，第 2 页放总预算汇总，第 3 页放智能预算判断，第 4 页放示例预算。"), empty(), empty()],
        [c("小红书截图", S.section), c("建议截“旅行总预算 / 人均预算 / 出行前建议准备资金”和“预算优化建议”两块。"), empty(), empty()],
        [c("品牌露出", S.section), c("导出前把底部“小红书 @你的账号名”替换为你的真实账号。", S.warning), empty(), empty()],
        [c("更多租车自驾攻略：小红书 @你的账号名", S.brand), empty(S.brand), empty(S.brand), empty(S.brand)],
      ],
      widths: [20, 72, 12, 12],
      merges: ["A1:D1", "B2:D2", "B3:D3", "B4:D4", "B5:D5", "B6:D6", "A7:D7"],
      freeze: true,
      rowHeight: 34,
      fitToHeight: 1,
    },
  ];

  writeWorkbook("自驾旅行预算测算表.xlsx", "自驾旅行预算测算表", sheets);
}

function main() {
  buildChecklistWorkbook();
  buildBudgetWorkbook();
  console.log("生成完成：第一次租车自驾取车验车清单.xlsx，自驾旅行预算测算表.xlsx");
}

main();
