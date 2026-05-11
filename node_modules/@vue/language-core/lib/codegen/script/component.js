"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateComponent = generateComponent;
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const merge_1 = require("../utils/merge");
function* generateComponent(options, ctx, scriptSetup, scriptSetupRanges) {
    yield `(await import('${options.vueCompilerOptions.lib}')).defineComponent({${utils_1.newLine}`;
    if (scriptSetupRanges.defineExpose) {
        yield `setup: () => ${names_1.names.exposed},${utils_1.newLine}`;
    }
    const emitOptionCodes = [...generateEmitsOption(options, scriptSetupRanges)];
    yield* emitOptionCodes;
    yield* generatePropsOption(options, ctx, scriptSetup, scriptSetupRanges, !!emitOptionCodes.length);
    if (options.vueCompilerOptions.target >= 3.5
        && options.vueCompilerOptions.inferComponentDollarRefs
        && options.templateAndStyleTypes.has(names_1.names.TemplateRefs)) {
        yield `__typeRefs: {} as ${names_1.names.TemplateRefs},${utils_1.newLine}`;
    }
    if (options.vueCompilerOptions.target >= 3.5
        && options.vueCompilerOptions.inferComponentDollarEl
        && options.templateAndStyleTypes.has(names_1.names.RootEl)) {
        yield `__typeEl: {} as ${names_1.names.RootEl},${utils_1.newLine}`;
    }
    yield `})`;
}
function* generateEmitsOption(options, scriptSetupRanges) {
    const optionCodes = [];
    const typeOptionCodes = [];
    if (scriptSetupRanges.defineModel.length) {
        optionCodes.push([`{} as ${names_1.names.NormalizeEmits}<typeof ${names_1.names.modelEmit}>`]);
        typeOptionCodes.push([names_1.names.ModelEmit]);
    }
    if (scriptSetupRanges.defineEmits) {
        const { name, typeArg, hasUnionTypeArg } = scriptSetupRanges.defineEmits;
        optionCodes.push([`{} as ${names_1.names.NormalizeEmits}<typeof ${name ?? names_1.names.emit}>`]);
        if (typeArg && !hasUnionTypeArg) {
            typeOptionCodes.push([names_1.names.Emit]);
        }
        else {
            typeOptionCodes.length = 0;
        }
    }
    if (options.vueCompilerOptions.target >= 3.5 && typeOptionCodes.length) {
        yield `__typeEmits: {} as `;
        yield* (0, merge_1.generateIntersectMerge)(typeOptionCodes);
        yield `,${utils_1.newLine}`;
    }
    else if (optionCodes.length) {
        yield `emits: `;
        yield* (0, merge_1.generateSpreadMerge)(optionCodes);
        yield `,${utils_1.newLine}`;
    }
}
function* generatePropsOption(options, ctx, scriptSetup, scriptSetupRanges, hasEmitsOption) {
    const optionGenerates = [];
    const typeOptionGenerates = [];
    if (options.templateAndStyleTypes.has(names_1.names.InheritedAttrs)) {
        const attrsType = hasEmitsOption
            ? `Omit<${names_1.names.InheritedAttrs}, keyof ${names_1.names.EmitProps}>`
            : names_1.names.InheritedAttrs;
        optionGenerates.push(function* () {
            const propsType = `${names_1.names.PickNotAny}<${ctx.localTypes.OmitIndexSignature}<${attrsType}>, {}>`;
            const optionType = `${ctx.localTypes.TypePropsToOption}<${propsType}>`;
            yield `{} as ${optionType}`;
        });
        typeOptionGenerates.push(function* () {
            yield `{} as ${attrsType}`;
        });
    }
    if (ctx.generatedTypes.has(names_1.names.PublicProps)) {
        if (options.vueCompilerOptions.target < 3.6) {
            optionGenerates.push(function* () {
                let propsType = `${ctx.localTypes.TypePropsToOption}<${names_1.names.PublicProps}>`;
                if (scriptSetupRanges.withDefaults?.arg) {
                    propsType = `${ctx.localTypes.WithDefaults}<${propsType}, typeof ${names_1.names.defaults}>`;
                }
                yield `{} as ${propsType}`;
            });
        }
        typeOptionGenerates.push(function* () {
            yield `{} as ${names_1.names.PublicProps}`;
        });
    }
    if (scriptSetupRanges.defineProps?.arg) {
        const { arg } = scriptSetupRanges.defineProps;
        optionGenerates.push(() => (0, utils_1.generateSfcBlockSection)(scriptSetup, arg.start, arg.end, codeFeatures_1.codeFeatures.navigation));
        typeOptionGenerates.length = 0;
    }
    const useTypeOption = options.vueCompilerOptions.target >= 3.5 && typeOptionGenerates.length;
    const useOption = (!useTypeOption || scriptSetupRanges.withDefaults) && optionGenerates.length;
    if (useTypeOption) {
        if (options.vueCompilerOptions.target >= 3.6
            && scriptSetupRanges.withDefaults?.arg) {
            yield `__defaults: ${names_1.names.defaults},${utils_1.newLine}`;
        }
        yield `__typeProps: `;
        yield* (0, merge_1.generateSpreadMerge)(typeOptionGenerates.map(g => g()));
        yield `,${utils_1.newLine}`;
    }
    if (useOption) {
        yield `props: `;
        yield* (0, merge_1.generateSpreadMerge)(optionGenerates.map(g => g()));
        yield `,${utils_1.newLine}`;
    }
}
//# sourceMappingURL=component.js.map