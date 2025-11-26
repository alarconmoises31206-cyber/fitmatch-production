export class ScoringEngine {
  
  calculateGoalsAlignment(client, trainer) {
    if (!client?.goal_primary || !trainer?.coach_focus) return 0;
    
    const primaryMatch = this.calculateGoalCompatibility(client.goal_primary, trainer.coach_focus);
    const intensityAlign = client.goal_intensity && trainer.coach_intensity 
      ? 100 - (20 * Math.abs(client.goal_intensity - trainer.coach_intensity))
      : 50;
    const trackingAlign = client.goal_tracking_style === trainer.coach_tracking_method ? 100 : 50;
    
    return Math.round(
      (primaryMatch * 0.6) + 
      (intensityAlign * 0.2) + 
      (trackingAlign * 0.2)
    );
  }
  
  calculateTrainingStyleAlignment(client, trainer) {
    const formatMatch = client.style_format === trainer.coach_modality ? 100 : 50;
    const pacingAlign = client.style_pacing && trainer.coach_pacing 
      ? 100 - (25 * Math.abs(client.style_pacing - trainer.coach_pacing))
      : 50;
    const structureAlign = client.style_structure && trainer.coach_adaptability
      ? 100 - (25 * Math.abs(client.style_structure - trainer.coach_adaptability))
      : 50;
    
    return Math.round(
      (formatMatch * 0.5) +
      (pacingAlign * 0.3) + 
      (structureAlign * 0.2)
    );
  }
  
  calculateMotivationAlignment(client, trainer) {
    const toneMatch = this.calculateToneCompatibility(client.motivation_coaching_tone, trainer.coach_tone);
    const energyAlign = client.motivation_energy_need && trainer.coach_energy_level
      ? 100 - (20 * Math.abs(client.motivation_energy_need - trainer.coach_energy_level))
      : 50;
    const motivationTypeMatch = client.motivation_type === trainer.coach_motivation_style ? 100 : 50;
    
    return Math.round(
      (toneMatch * 0.4) +
      (energyAlign * 0.4) +
      (motivationTypeMatch * 0.2)
    );
  }
  
  calculateExperienceFit(client, trainer) {
    if (!client?.exp_years || !trainer?.coach_years) return 50;
    const yearDiff = Math.abs(client.exp_years - trainer.coach_years);
    return Math.max(0, 100 - (10 * yearDiff));
  }
  
  calculateLogisticsFit(client, trainer) {
    // Edge cases
    if (client.log_hours_per_week === 0) return 0;
    if (client.log_gender_preference && trainer.coach_gender_preference && 
        client.log_gender_preference !== trainer.coach_gender_preference) return 0;
    
    const locationMatch = this.calculateLocationCompatibility(client.log_location, trainer.coach_location);
    const budgetMatch = client.log_budget === trainer.coach_rate ? 100 : 0;
    const languageMatch = client.log_language === trainer.coach_language ? 100 : 0;
    
    return Math.round(
      (locationMatch * 0.5) +
      (budgetMatch * 0.3) +
      (languageMatch * 0.2)
    );
  }
  
  calculateGlobalScore(subScores) {
    return Math.round(
      (subScores.goalsAlignment * 0.30) +
      (subScores.trainingStyleAlignment * 0.25) + 
      (subScores.motivationAlignment * 0.20) +
      (subScores.experienceFit * 0.15) +
      (subScores.logisticsFit * 0.10)
    );
  }
  
  // Helper methods
  calculateGoalCompatibility(clientGoal, trainerFocus) {
    const compatibility = {
      'weight_loss_weight_loss': 100,
      'muscle_gain_muscle_gain': 100,
      'performance_performance': 100,
      'weight_loss_general_health': 70,
      'general_health_weight_loss': 70,
      'muscle_gain_performance': 70,
      'performance_muscle_gain': 70
    };
    
    return compatibility[`${clientGoal}_${trainerFocus}`] || 0;
  }
  
  calculateToneCompatibility(clientTone, trainerTone) {
    if (clientTone === trainerTone) return 100;
    
    const compatibility = {
      'strict_balanced': 70,
      'balanced_strict': 70,
      'balanced_encouraging': 70,
      'encouraging_balanced': 70
    };
    
    return compatibility[`${clientTone}_${trainerTone}`] || 0;
  }
  
  calculateLocationCompatibility(clientLoc, trainerLoc) {
    if (clientLoc === trainerLoc) return 100;
    if (clientLoc === 'virtual' || trainerLoc === 'virtual') return 80;
    return 0;
  }
  
  async generateFitMatchScore(clientData, trainerData) {
    const subScores = {
      goalsAlignment: this.calculateGoalsAlignment(clientData, trainerData),
      trainingStyleAlignment: this.calculateTrainingStyleAlignment(clientData, trainerData),
      motivationAlignment: this.calculateMotivationAlignment(clientData, trainerData),
      experienceFit: this.calculateExperienceFit(clientData, trainerData),
      logisticsFit: this.calculateLogisticsFit(clientData, trainerData)
    };
    
    const globalScore = this.calculateGlobalScore(subScores);
    
    return {
      ...subScores,
      globalScore
    };
  }
}