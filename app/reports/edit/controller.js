import AbstractEditController from 'hospitalrun/controllers/abstract-edit-controller';
import Ember from 'ember';
import PatientSubmodule from 'hospitalrun/mixins/patient-submodule';
import PatientDiagnosis from 'hospitalrun/mixins/patient-diagnosis';
import PouchDbMixin from 'hospitalrun/mixins/pouchdb';

export default AbstractEditController.extend(PatientSubmodule, PatientDiagnosis, PouchDbMixin, {
  lookupListsToUpdate: [{
    name: 'physicianList',
    property: 'model.surgeon',
    id: 'physician_list'
  }],

  newReport: false,

  visitsController: Ember.inject.controller('visits'),

  physicianList: Ember.computed.alias('visitsController.physicianList'),

  logoURL: Ember.computed.alias('visitsController.printHeader.value.logoURL'),
  facilityName: Ember.computed.alias('visitsController.printHeader.value.facilityName'),
  headerLine1: Ember.computed.alias('visitsController.printHeader.value.headerLine1'),
  headerLine2: Ember.computed.alias('visitsController.printHeader.value.headerLine2'),
  headerLine3: Ember.computed.alias('visitsController.printHeader.value.headerLine3'),

  diagnosisList: Ember.computed.alias('visitsController.diagnosisList'),
  diagnosisContainer: Ember.computed('model.visit', function() {
    let visit = this.get('model.visit');
    let isOutPatient = visit.get('outPatient');
    if (isOutPatient) {
      return visit;
    }
    return null;
  }),

  nextAppointment: Ember.computed('model', function() {
    return this.getPatientFutureAppointment(this.get('model.visit'));
  }),

  currentOperativePlan: Ember.computed('model', function() {
    let operativePlans = this.get('model.visit.patient.operativePlans');
    return operativePlans.findBy('isPlanned', true);
  }),

  completedBy: Ember.computed('model', function() {
    return this.get('model.modifiedBy');
  }),

  additionalButtons: Ember.computed('model.{isNew}', function() {
    let isNew = this.get('model.isNew');
    if (!isNew) {
      return [{
        class: 'btn btn-primary on-white',
        buttonAction: 'printReport',
        buttonIcon: 'octicon octicon-check',
        buttonText: 'Print'
      }];
    }
  }),

  updateCapability: 'add_report',

  beforeUpdate() {
    return new Ember.RSVP.Promise(function(resolve) {
      if (this.get('model.isNew')) {
        let appointmentDate = this.get('nextAppointment').get('content');
        this.get('model').set('nextAppointment', appointmentDate);
        if (this.get('model.visit.outPatient')) {
          this.get('model').set('reportType', 'OPD Report');
        } else {
          this.get('model').set('reportType', 'Discharge Report');
        }
      }
      resolve();
    }.bind(this));
  },

  afterUpdate() {
    let alertTitle = this.get('i18n').t('reports.titles.saved');
    let alertMessage = this.get('i18n').t('reports.messages.saved');
    this.saveVisitIfNeeded(alertTitle, alertMessage);
    let editTitle = this.get('model.visit.outPatient') ? this.get('i18n').t('reports.opd.titles.edit') : this.get('i18n').t('reports.discharge.titles.edit');
    let sectionDetails = {};
    sectionDetails.currentScreenTitle = editTitle;
    this.send('setSectionHeader', sectionDetails);
  },

  actions: {
    printReport() {
      window.print();
    }
  }

});
