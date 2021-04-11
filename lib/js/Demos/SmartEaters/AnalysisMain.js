"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const EaterAnalysis_1 = require("./EaterAnalysis");
// styling
document.body.style.padding = '0';
document.body.style.margin = '0';
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    if (location.search.indexOf('?b=') !== -1) {
        const blob = location.search.split('?b=')[1];
        const analysis = yield EaterAnalysis_1.EaterAnalysis.fromBlob(blob);
        const cnv = analysis.domElement;
        cnv.style.display = 'block';
        document.body.appendChild(cnv);
        analysis.start();
    }
    ;
}));
