"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[7025],{7025:function(t,e,r){function a(t){var e=t.match(/^\s*\S/);return t.skipToEnd(),e?"error":null}r.r(e),r.d(e,{asciiArmor:function(){return s}});var s={token:function(t,e){var r;if("top"==e.state)return t.sol()&&(r=t.match(/^-----BEGIN (.*)?-----\s*$/))?(e.state="headers",e.type=r[1],"tag"):a(t);if("headers"==e.state){if(t.sol()&&t.match(/^\w+:/))return e.state="header","atom";var s=a(t);return s&&(e.state="body"),s}return"header"==e.state?(t.skipToEnd(),e.state="headers","string"):"body"==e.state?t.sol()&&(r=t.match(/^-----END (.*)?-----\s*$/))?r[1]!=e.type?"error":(e.state="end","tag"):t.eatWhile(/[A-Za-z0-9+\/=]/)?null:(t.next(),"error"):"end"==e.state?a(t):void 0},blankLine:function(t){"headers"==t.state&&(t.state="body")},startState:function(){return{state:"top",type:null}}}}}]);
//# sourceMappingURL=7025.fd76a27e.chunk.js.map