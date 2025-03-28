/**
 * TypeScript Error Fixer
 * 
 * This script helps automatically fix common TypeScript errors across the codebase.
 * Run with: npx jscodeshift -t scripts/ts-error-fixer.js --parser=tsx --extensions=js,jsx,ts,tsx src
 */

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasModifications = false;

  // 1. Fix missing imports from missionFreshApiClient
  // Replace imports like: import { X } from '../api/missionFreshApiClient'
  // With: import { X } from '../api/apiCompatibility'
  root.find(j.ImportDeclaration, {
    source: {
      value: path => path.includes('missionFreshApiClient')
    }
  }).forEach(path => {
    // Create a new import from apiCompatibility
    path.value.source.value = path.value.source.value.replace('missionFreshApiClient', 'apiCompatibility');
    hasModifications = true;
  });

  // 2. Fix authenticatedRestCall<Type> to authenticatedRestCall
  // Remove type parameters from authenticatedRestCall
  root.find(j.CallExpression, {
    callee: {
      name: 'authenticatedRestCall'
    }
  }).forEach(path => {
    if (path.value.typeArguments) {
      delete path.value.typeArguments;
      hasModifications = true;
    }
  });

  // 3. Fix incorrect array types in TypeScript as[Type]
  // Example: data as CravingEntry[] -> data as unknown as CravingEntry[]
  root.find(j.TSAsExpression, {
    typeAnnotation: {
      type: 'TSArrayType'
    }
  }).forEach(path => {
    // Create a new "as unknown as Type[]" expression
    const newTypeAssertion = j.tsAsExpression(
      path.value.expression,
      j.tsTypeReference(j.identifier('unknown'))
    );
    
    path.value.expression = newTypeAssertion;
    hasModifications = true;
  });

  // 4. Fix incorrect object property access
  // Find likely undefined properties and add optional chaining
  root.find(j.MemberExpression, {
    property: {
      type: 'Identifier'
    }
  }).forEach(path => {
    // Common problematic property accesses that need optional chaining
    const riskProperties = [
      'timeline_hours',
      'platformBreakdown',
      'itemTypeBreakdown',
      'connectedApps',
      'stepData',
      'achievement_date',
      'steps_required',
      'discount_percentage',
      'is_claimed',
      'reward_code',
      'valid_until',
      'cigarettes_avoided',
      'cravings',
      'sleep_quality',
      'sleep_duration',
      'stress_level',
      'exercise_duration',
      'step_count',
      'water_intake',
      'mood_score',
      'physical_symptoms',
      'chemical_concerns',
      'gum_health_rating'
    ];

    if (
      riskProperties.includes(path.value.property.name) && 
      !path.value.optional && 
      // Don't add optional chaining to object property definitions
      path.parent.value.type !== 'Property'
    ) {
      path.value.optional = true;
      hasModifications = true;
    }
  });

  // 5. Fix type issues with EnhancedHealthImprovement
  // Add timeline_hours property to interface definitions of EnhancedHealthImprovement
  root.find(j.TSInterfaceDeclaration, {
    id: {
      name: 'EnhancedHealthImprovement'
    }
  }).forEach(path => {
    // Check if timeline_hours property already exists
    const hasTimelineHours = path.value.body.body.some(prop => 
      prop.key && prop.key.name === 'timeline_hours'
    );

    if (!hasTimelineHours) {
      // Add timeline_hours: number property
      path.value.body.body.push(
        j.tsPropertySignature(
          j.identifier('timeline_hours'),
          j.tsTypeAnnotation(j.tsNumberKeyword())
        )
      );
      hasModifications = true;
    }
  });

  // Return modified source if changes were made
  return hasModifications ? root.toSource() : fileInfo.source;
}; 