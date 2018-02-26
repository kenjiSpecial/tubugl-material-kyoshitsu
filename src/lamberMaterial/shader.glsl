1: 
2: precision highp float;
3: precision highp int;
4: 
5: uniform vec3 diffuse;
6: uniform vec3 emissive;
7: uniform float opacity;
8: 
9: varying vec3 vLightFront;
10: 
11: // #ifdef DOUBLE_SIDED
12: 
13: 	varying vec3 vLightBack;
14: 
15: // #endif
16: 
17: // common glsl
18: 
19: #define PI 3.14159265359
20: #define PI2 6.28318530718
21: #define PI_HALF 1.5707963267949
22: #define RECIPROCAL_PI 0.31830988618
23: #define RECIPROCAL_PI2 0.15915494
24: #define LOG2 1.442695
25: #define EPSILON 1e-6
26: 
27: #define saturate(a) clamp( a, 0.0, 1.0 )
28: #define whiteCompliment(a) ( 1.0 - saturate( a ) )
29: 
30: float pow2( const in float x ) { return x*x; }
31: 
32: struct IncidentLight {
33: 	vec3 color;
34: 	vec3 direction;
35: 	bool visible;
36: };
37: 
38: struct ReflectedLight {
39: 	vec3 directDiffuse;
40: 	vec3 directSpecular;
41: 	vec3 indirectDiffuse;
42: 	vec3 indirectSpecular;
43: };
44: 
45: struct GeometricContext {
46: 	vec3 position;
47: 	vec3 normal;
48: 	vec3 viewDir;
49: };
50: 
51: // http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
52: vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
53: 
54: 	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
55: 
56: }
57: 
58: // common.glsl
59: // envmapParsFragment.glsl
60: 
61: //# if defined( USE_ENVMAP ) || defined( PHYSICAL )
62: 	uniform float reflectivity;
63: 	uniform float envMapIntenstiy;
64: // #endif
65: 
66: // #ifdef USE_ENVMAP
67: 
68: 	// #if ! defined( PHYSICAL ) && ( defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) )
69: 		varying vec3 vWorldPosition;
70: 	// #endif
71: 
72: 	// #ifdef ENVMAP_TYPE_CUBE
73: 		uniform samplerCube envMap;
74: 	// #else
75: 	// 	uniform sampler2D envMap;
76: 	// #endif
77: 	uniform float flipEnvMap;
78: 
79: 	// #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( PHYSICAL )
80: 		uniform float refractionRatio;
81: 	// #else
82: 		varying vec3 vReflect;
83: 	// #endif
84: 
85: // #endif
86: 
87: // envmapParsFragment.glsl
88: bool testLightInRange( const in float lightDistance, const in float cutoffDistance ) {
89: 
90: 	return any( bvec2( cutoffDistance == 0.0, lightDistance < cutoffDistance ) );
91: 
92: }
93: 
94: float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
95: 
96: 		if( decayExponent > 0.0 ) {
97: 
98: #if defined ( PHYSICALLY_CORRECT_LIGHTS )
99: 
100: 			// based upon Frostbite 3 Moving to Physically-based Rendering
101: 			// page 32, equation 26: E[window1]
102: 			// http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf
103: 			// this is intended to be used on spot and point lights who are represented as luminous intensity
104: 			// but who must be converted to luminous irradiance for surface lighting calculation
105: 			float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
106: 			float maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
107: 			return distanceFalloff * maxDistanceCutoffFactor;
108: 
109: #else
110: 
111: 			return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
112: 
113: #endif
114: 
115: 		}
116: 
117: 		return 1.0;
118: }
119: 
120: vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {
121: 
122: 	return RECIPROCAL_PI * diffuseColor;
123: 
124: } // validated
125: 
126: 
127: vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {
128: 
129: 	// Original approximation by Christophe Schlick '94
130: 	//;float fresnel = pow( 1.0 - dotLH, 5.0 );
131: 
132: 	// Optimized variant (presented by Epic at SIGGRAPH '13)
133: 	float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );
134: 
135: 	return ( 1.0 - specularColor ) * fresnel + specularColor;
136: 
137: } // validated
138: 
139: 
140: // Microfacet Models for Refraction through Rough Surfaces - equation (34)
141: // http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
142: // alpha is "roughness squared" in Disney’s reparameterization
143: float G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {
144: 
145: 	// geometry term = G(l)⋅G(v) / 4(n⋅l)(n⋅v)
146: 
147: 	float a2 = pow2( alpha );
148: 
149: 	float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
150: 	float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
151: 
152: 	return 1.0 / ( gl * gv );
153: 
154: } // validated
155: 
156: // from page 12, listing 2 of http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf
157: float G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
158: 
159: 	float a2 = pow2( alpha );
160: 
161: 	// dotNL and dotNV are explicitly swapped. This is not a mistake.
162: 	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
163: 	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
164: 
165: 	return 0.5 / max( gv + gl, EPSILON );
166: }
167: 
168: 
169: 
170: // Microfacet Models for Refraction through Rough Surfaces - equation (33)
171: // http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
172: // alpha is "roughness squared" in Disney’s reparameterization
173: float D_GGX( const in float alpha, const in float dotNH ) {
174: 
175: 	float a2 = pow2( alpha );
176: 
177: 	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1
178: 
179: 	return RECIPROCAL_PI * a2 / pow2( denom );
180: 
181: }
182: 
183: 
184: // GGX Distribution, Schlick Fresnel, GGX-Smith Visibility
185: vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {
186: 
187: 	float alpha = pow2( roughness ); // UE4's roughness
188: 
189: 	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
190: 
191: 	float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
192: 	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
193: 	float dotNH = saturate( dot( geometry.normal, halfDir ) );
194: 	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
195: 
196: 	vec3 F = F_Schlick( specularColor, dotLH );
197: 
198: 	float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );
199: 
200: 	float D = D_GGX( alpha, dotNH );
201: 
202: 	return F * ( G * D );
203: 
204: } // validated
205: 
206: 
207: // ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
208: vec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {
209: 
210: 	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
211: 
212: 	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
213: 
214: 	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
215: 
216: 	vec4 r = roughness * c0 + c1;
217: 
218: 	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
219: 
220: 	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
221: 
222: 	return specularColor * AB.x + AB.y;
223: 
224: } // validated
225: 
226: 
227: float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {
228: 
229: 	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
230: 	return 0.25;
231: 
232: }
233: 
234: float D_BlinnPhong( const in float shininess, const in float dotNH ) {
235: 
236: 	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
237: 
238: }
239: 
240: vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {
241: 
242: 	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
243: 
244: 	//float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
245: 	//float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
246: 	float dotNH = saturate( dot( geometry.normal, halfDir ) );
247: 	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
248: 
249: 	vec3 F = F_Schlick( specularColor, dotLH );
250: 
251: 	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );
252: 
253: 	float D = D_BlinnPhong( shininess, dotNH );
254: 
255: 	return F * ( G * D );
256: 
257: } // validated
258: 
259: // source: http://simonstechblog.blogspot.ca/2011/12/microfacet-brdf.html
260: float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {
261: 	return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );
262: }
263: 
264: float BlinnExponentToGGXRoughness( const in float blinnExponent ) {
265: 	return sqrt( 2.0 / ( blinnExponent + 2.0 ) );
266: }
267: 
268: // lightPars.glsl
269: 
270: uniform vec3 ambientLightColor;
271: 
272: vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
273: 
274: 	vec3 irradiance = ambientLightColor;
275: 
276: 	#ifndef PHYSICALLY_CORRECT_LIGHTS
277: 
278: 		irradiance *= PI;
279: 
280: 	#endif
281: 
282: 	return irradiance;
283: 
284: }
285: 
286: 
287: struct DirectionalLight {
288:     vec3 direction;
289:     vec3 color;
290: };
291: 
292: uniform DirectionalLight directionalLight;
293: 
294: void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {
295: 
296:     directLight.color = directionalLight.color;
297:     directLight.direction = directionalLight.direction;
298: 
299: }
300: 
301: struct PointLight {
302:     vec3 position;
303:     vec3 color;
304:     float distance;
305:     float decay;
306: 
307: };
308: 
309: uniform PointLight pointLight;
310: 
311: 
312: // directLight is an out parameter as having it as a return value caused compiler errors on some devices
313: void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {
314: 
315:     vec3 lVector = vec3(viewMatrix * vec4(pointLight.position, 1.0)) - geometry.position;
316:     directLight.direction = normalize( lVector );
317: 
318:     float lightDistance = length( lVector );
319: 
320:     directLight.color = pointLight.color;
321:     directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );
322:     directLight.visible = ( directLight.color != vec3( 0.0 ) );
323: 
324: }
325: 
326: // lightPars.glsl
327: 
328: #define GAMMA_FACTOR 2
329: 
330: vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {
331: 	return vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );
332: }
333: vec4 envMapTexelToLinear( vec4 value ) { return GammaToLinear( value, float( GAMMA_FACTOR ) ); }
334: 
335: vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {
336:     return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );
337: }
338: 
339: vec4 linearToOutputTexel( vec4 value ) { return LinearToGamma( value, float( GAMMA_FACTOR ) ); }
340: 
341: void main(){
342: 	 vec4 diffuseColor = vec4(diffuse, opacity);
343: 	 ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
344: 	 vec3 totalEmissiveRadiance = emissive;
345: 
346: 	 // accumulation
347: 	 reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
348: 
349: 	 reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
350: 
351: 	 reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack; 
352: 
353: 	 reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb )
354: 
355: 	 vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
356:  
357: 	 gl_FragColor = vec4( outgoingLight, diffuseColor.a );
358: 
359: 	 gl_FragColor = linearToOutputTexel(gl_FragColor);
360: }
361: 