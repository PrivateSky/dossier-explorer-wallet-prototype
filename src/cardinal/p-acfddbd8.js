import{g as e}from"./p-2eb42df6.js";import{d as t,e as n,f as s,g as i}from"./p-7745c6f7.js";import{c as o}from"./p-5c62ed62.js";function r(r){return function(c,f){const{connectedCallback:l,componentWillLoad:a,componentDidLoad:d,render:u}=c;let p="psk-send-events",b=s,m=t,h="definedEvents";c.componentWillLoad=function(){let s=e(this);if(!s.hasAttribute(t)&&!s.hasAttribute(n))return a&&a.call(this)},c.componentDidLoad=function(){let s=e(this);if(!s.hasAttribute(t)&&!s.hasAttribute(n))return d&&d.call(this)},c.connectedCallback=function(){let t=this,s=e(t);if(r.controllerInteraction&&(m=n,h="definedControllers",b=i,p="psk-send-controllers"),s.hasAttribute(m)){if(!t.componentDefinitions)return t.componentDefinitions={},t.componentDefinitions[h]=[Object.assign(Object.assign({},r),{eventName:String(f)})],l&&l.call(t);let e=t.componentDefinitions;const n=Object.assign(Object.assign({},r),{eventName:String(f)});if(e&&e.hasOwnProperty(b)){let t=[...e[b]];t.push(n),e[b]=[...t]}else e[b]=[n];t.componentDefinitions=Object.assign({},e)}return l&&l.call(t)},c.render=function(){if(!this.componentDefinitions||!this.componentDefinitions||!this.componentDefinitions[b])return u&&u.call(this);let e=this.componentDefinitions[b];e&&(e=e.reverse()),o(p,{composed:!0,bubbles:!0,cancelable:!0,detail:e},!0)}}}export{r as T};