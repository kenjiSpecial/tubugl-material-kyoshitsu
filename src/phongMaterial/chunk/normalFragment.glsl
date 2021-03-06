// <normalFargment.glsl>

// #ifdef FLAT_SHADED

// 	// vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
// 	// vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
// 	// vec3 normal = normalize( cross( fdx, fdy ) );

//   // optimization
//   vec3 fdx = dFdx( vViewPosition );
//   vec3 fdy = dFdy( vViewPosition );
//   vec3 normal = normalize( cross( fdx, fdy ) );

// #else

	vec3 normal = normalize( vNormal );

	// #ifdef DOUBLE_SIDED

	// 	normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );

	// #endif

// #endif

// #ifdef USE_NORMALMAP

// 	normal = perturbNormal2Arb( -vViewPosition, normal );

// #elif defined( USE_BUMPMAP )

// 	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

// #endif

// <normalFargment.glsl>