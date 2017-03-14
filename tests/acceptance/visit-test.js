import Ember from 'ember';
import moment from 'moment';
import { module, test } from 'qunit';
import startApp from 'hospitalrun/tests/helpers/start-app';

const { isEmpty } = Ember;

const visitData = {
  outPatient: {
    PRIMARY_DIAGNOSIS: 'ACL deficient knee, right',
    SECONDARY_DIAGNOSIS: 'ACL deficient knee, left',
    OPERATION_DESCRIPTION: 'Describe Operation here',
    PROCEDURE_SPLINT: 'application of long arm post splint',
    ADMISSION_INSTRUCTIONS: 'Admission Instructions here',
    OPD_PROCEDURE_DESCRIPTION: 'Bilateral knee Release',
    OPD_PROCEDURE_PHYSICIAN: 'Sarah Kearney',
    LAB_TYPE: 'Cholesterol',
    IMAGING_TYPE: 'Cervical Spine AP-L',
    MEDICATION_INPUT: 'Cefazolin 500mg vial (Hazolin) - m00001 (999998 available)',
    MEDICATION_PRESCRIPTION: '4 doses before meals',
    MEDICATION_QUANTITY: '4',
    APPOINTMENT_START_DATE: moment().add(7, 'days').format('l h:mm A'),
    APPOINTMENT_END_DATE: moment().add(8, 'days').format('l h:mm A')
  },
  admission: {
    // admission visit data goes here
  }
};

module('Acceptance | visits', {
  beforeEach() {
    this.application = startApp();
  },

  afterEach() {
    Ember.run(this.application, 'destroy');
  }
});

test('Add admission visit', function(assert) {
  runWithPouchDump('patient', function() {
    authenticateUser();
    addVisit(assert);
    addDischargeData(assert);
    newReport(assert, 'Discharge');
    dischargeReport(assert);
    saveReport(assert, 'Discharge');
    editReport(assert, 'Discharge');
  });
});

test('Add OPD visit', function(assert) {
  runWithPouchDump('patient', function() {
    authenticateUser();
    addVisit(assert, 'Clinic');
    addOutpatientData(assert);
    newReport(assert, 'OPD');
    checkOutpatientData(assert);
    saveReport(assert, 'OPD');
    editReport(assert, 'OPD');
  });
});

test('Edit visit', function(assert) {
  runWithPouchDump('patient', function() {
    authenticateUser();
    visit('/patients');
    andThen(function() {
      assert.equal(currentURL(), '/patients', 'Patient url is correct');
      click('button:contains(Edit)');
    });
    andThen(function() {
      assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Joe Bagadonuts patient record displays');
      click('[data-test-selector=visits-tab]');
      waitToAppear('#visits button:contains(Edit)');
    });
    andThen(function() {
      click('#visits button:contains(Edit)');
    });
    andThen(function() {
      assert.equal(currentURL(), '/visits/edit/03C7BF8B-04E0-DD9E-9469-96A5604F5340', 'Visit url is correct');
      click('a:contains(Add Diagnosis)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Add Diagnosis', 'Add Diagnosis dialog displays');
      fillIn('.diagnosis-text input', 'Broken Arm');
      click('.modal-footer button:contains(Add)');
      waitToAppear('a.primary-diagnosis');
    });
    andThen(function() {
      assert.equal(find('a.primary-diagnosis:contains(Broken Arm)').length, 1, 'New primary diagnosis appears');
      click('button:contains(New Medication)');
    });
    andThen(function() {
      assert.equal(currentURL(), '/medication/edit/new?forVisitId=03C7BF8B-04E0-DD9E-9469-96A5604F5340', 'New medication url is correct');
      assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'New medication prepopulates with patient');
      click('button:contains(Cancel)');
    });
    andThen(function() {
      click('button:contains(New Lab)');
    });
    andThen(function() {
      assert.equal(currentURL(), '/labs/edit/new?forVisitId=03C7BF8B-04E0-DD9E-9469-96A5604F5340', 'New lab url is correct');
      assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'New lab prepopulates with patient');
      click('button:contains(Cancel)');
    });
    andThen(function() {
      click('button:contains(New Imaging)');
    });
    andThen(function() {
      assert.equal(currentURL(), '/imaging/edit/new?forVisitId=03C7BF8B-04E0-DD9E-9469-96A5604F5340', 'New imaging url is correct');
      assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'New imaging prepopulates with patient');
      click('button:contains(Cancel)');
    });
    andThen(function() {
      click('button:contains(New Vitals)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      fillIn('.temperature-text input', '34.56');
      fillIn('.weight-text input', '34.56');
      fillIn('.height-text input', '34.56');
      fillIn('.sbp-text input', '34.56');
      fillIn('.dbp-text input', '34.56');
      fillIn('.heart-rate-text input', '34.56');
      fillIn('.respiratory-rate-text input', '34.56');
      click('.modal-footer button:contains(Add)');
      waitToAppear('#visit-vitals tr:last td:contains(34.56)');
    });
    andThen(function() {
      assert.equal(find('#visit-vitals tr:last td:contains(34.56)').length, 7, 'New vitals appears');
      click('button:contains(Add Item)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      typeAheadFillIn('.charge-item-name', 'Gauze pad');
      click('.modal-footer button:contains(Add)');
    });
    andThen(function() {
      waitToDisappear('.modal-dialog');
      waitToAppear('td.charge-item-name');
    });
    andThen(function() {
      assert.equal(find('td.charge-item-name').text(), 'Gauze pad', 'New charge item appears');
    });
    andThen(function() {
      updateVisit(assert, 'Update');
    });
    andThen(function() {
      click('a.primary-diagnosis:contains(Broken Arm)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Edit Diagnosis', 'Edit Diagnosis modal appears');
      assert.equal(find('.modal-footer button:contains(Delete)').length, 1, 'Delete button appears');
    });
    andThen(function() {
      click('.modal-footer button:contains(Delete)');
    });
    andThen(function() {
      waitToDisappear('.modal-dialog');
    });
    andThen(function() {
      click('#visit-vitals tr:last button:contains(Delete)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Delete Vitals', 'Delete Vitals dialog displays');
      click('.modal-footer button:contains(Delete)');
      click('[data-test-selector=charges-tab]');
    });
    andThen(function() {
      click('.charge-items tr:last button:contains(Delete)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Delete Charge Item', 'Delete Charge Item dialog displays');
      click('.modal-footer button:contains(Ok)');
    });
    andThen(function() {
      waitToDisappear('.modal-dialog');
    });
    andThen(function() {
      assert.equal(find('a.primary-diagnosis:contains(Broken Arm)').length, 0, 'New primary diagnosis is deleted');
      assert.equal(find('#visit-vitals tr:last td:contains(34.56)').length, 0, 'Vital is deleted');
      assert.equal(find('td.charge-item-name').length, 0, 'Charge item is deleted');
    });
  });
});

test('Delete visit', function(assert) {
  runWithPouchDump('patient', function() {
    authenticateUser();
    visit('/patients');
    andThen(function() {
      assert.equal(currentURL(), '/patients', 'Patient url is correct');
      click('button:contains(Edit)');
    });
    andThen(function() {
      assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Joe Bagadonuts patient record displays');
      click('[data-test-selector=visits-tab]');
      waitToAppear('#visits button:contains(Delete)'); // Make sure visits have been retrieved.
    });
    andThen(function() {
      assert.equal(find('#visits tr').length, 2, 'One visit is displayed to delete');
      click('#visits button:contains(Delete)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Delete Visit', 'Delete Visit confirmation displays');
      click('.modal-footer button:contains(Delete)');
    });
    andThen(function() {
      waitToDisappear('.modal-dialog');
      waitToDisappear('#visits td:contains(Fall from in-line roller-skates, initial encounter)');
    });
    andThen(function() {
      assert.equal(find('#visits tr').length, 1, 'Visit is deleted');
    });
  });
});

function addVisit(assert, type) {
  visit('/patients');
  andThen(function() {
    assert.equal(currentURL(), '/patients', 'Patient url is correct');
    click('button:contains(Edit)');
  });
  andThen(function() {
    assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Joe Bagadonuts patient record displays');
    click('[data-test-selector=visits-tab]');
    waitToAppear('#visits button:contains(Edit)');
  });
  andThen(function() {
    click('#visits button:contains(New Visit)');
    waitToAppear('#visit-info');
  });
  andThen(function() {
    assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Joe Bagadonuts displays as patient for visit');
    updateVisit(assert, 'Add', type);
  });

}

function addOutpatientData(assert) {
  andThen(() =>{
    click('a:contains(Add Diagnosis)');
    waitToAppear('.modal-dialog');
  });
  andThen(() => {
    assert.equal(find('.modal-title').text(), 'Add Diagnosis', 'Add Diagnosis dialog displays');
    fillIn('.diagnosis-text input', visitData.outPatient.PRIMARY_DIAGNOSIS);
    click('.modal-footer button:contains(Add)');
  });
  andThen(function() {
    waitToDisappear('.modal-dialog');
  });
  andThen(() => {
    click('a:contains(Add Diagnosis)');
    waitToAppear('.modal-dialog');
  });
  andThen(() => {
    assert.equal(find('.modal-title').text(), 'Add Diagnosis', 'Add Diagnosis dialog displays');
    fillIn('.diagnosis-text input', visitData.outPatient.SECONDARY_DIAGNOSIS);
    click('.secondary-diagnosis input');
    click('.modal-footer button:contains(Add)');
  });
  andThen(function() {
    waitToDisappear('.modal-dialog');
  });
  andThen(() => {
    click('a:contains(Add Operative Plan)');
  });
  andThen(() => {
    assert.ok(currentURL().indexOf('/patients/operative-plan/new?forVisitId') > -1, 'New operative plan URL is visited');
    assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Joe Bagadonuts patient header displays');
    assert.equal(find('.view-current-title').text(), 'New Operative Plan', 'New operative plan title is correct');
    fillIn('.operation-description textarea', visitData.outPatient.OPERATION_DESCRIPTION);
    typeAheadFillIn('.procedure-description', visitData.outPatient.PROCEDURE_SPLINT);
    click('button:contains(Add Procedure)');
    waitToAppear('.procedure-listing td.procedure-description');
    fillIn('.admission-instructions textarea', visitData.outPatient.ADMISSION_INSTRUCTIONS);
  });
  updateVisitData(assert, 'Plan Saved');
  andThen(() => {
    click('[data-test-selector=procedures-tab]');
    waitToAppear('[data-test-selector=new-procedure-btn]');
    assert.equal(find('[data-test-selector=new-procedure-btn]').text().trim(), 'New Procedure', 'New Procedure button displayed');
    click('[data-test-selector=new-procedure-btn]');
  });
  andThen(() => {
    assert.ok(currentURL().indexOf('visits/procedures/edit/new?forVisitId') > -1, 'New Procedures URL is visited');
    typeAheadFillIn('.procedure-description', visitData.outPatient.OPD_PROCEDURE_DESCRIPTION);
    typeAheadFillIn('.procedure-physician', visitData.outPatient.OPD_PROCEDURE_PHYSICIAN);
  });
  updateVisitData(assert, 'Procedure Saved');
  andThen(() => {
    click('button:contains(New Lab)');
  });
  andThen(() => {
    assert.ok(currentURL().indexOf('/labs/edit/new?forVisitId') > -1, 'New Lab URL is visited');
    typeAheadFillIn('.test-lab-type', visitData.outPatient.LAB_TYPE);
  });
  updateVisitData(assert, 'Lab Request Saved');
  andThen(() => {
    click('button:contains(New Imaging)');
  });
  andThen(() => {
    assert.ok(currentURL().indexOf('/imaging/edit/new?forVisitId') > -1, 'New Imaging URL is visited');
    typeAheadFillIn('.imaging-type-input', visitData.outPatient.IMAGING_TYPE);
  });
  updateVisitData(assert, 'Imaging Request Saved');
  andThen(() => {
    click('button:contains(New Medication)');
  });
  andThen(() => {
    assert.ok(currentURL().indexOf('/medication/edit/new?forVisitId') > -1, 'New Medication URL is visited');
    typeAheadFillIn('.test-medication-input', visitData.outPatient.MEDICATION_INPUT);
    fillIn('.test-medication-prescription textarea', visitData.outPatient.MEDICATION_PRESCRIPTION);
    fillIn('.test-quantity-input input', visitData.outPatient.MEDICATION_QUANTITY);
  });
  updateVisitData(assert, 'Medication Request Saved');
  andThen(() => {
    click('button:contains(New Appointment)');
  });
  andThen(() => {
    assert.ok(currentURL().indexOf('/appointments/edit/new?forVisitId') > -1, 'New Appointment URL is visited');
    click('.appointment-all-day input');
    fillIn('.test-appointment-start input', visitData.outPatient.APPOINTMENT_START_DATE);
    fillIn('.test-appointment-end input', visitData.outPatient.APPOINTMENT_END_DATE);
  });
  updateVisitData(assert, 'Appointment Saved');
}

function addDischargeData(assert) {
  // add discharge report data elements here
  assert.equal(1, 1);
}

function newReport(assert, type) {
  andThen(function() {
    click('[data-test-selector=reports-tab]');
    waitToAppear('[data-test-selector=report-btn]');
    assert.equal(find('[data-test-selector=report-btn]').text().trim(), `New ${type} Report`, 'Discharge report can be created for this type of visit');
    click('[data-test-selector=report-btn]');
  });
  andThen(function() {
    assert.ok(currentURL().indexOf('visits/reports/edit/new') > -1, 'Report url is correct');
    assert.equal(find('.view-current-title').text(), `New ${type} Report`, `${type} report title displayed correctly`);
    assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Patient record displays');
  });
}

function checkOutpatientData(assert) {
  andThen(() => {
    assert.equal(find('.patient-id .ps-info-data').text(), 'P00001', 'Patient ID is displayed');
    assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Patient First Name & Last Name is displayed');
    assert.equal(find('.test-visit-date .test-visit-date-label').text().trim(), 'Date of Visit:', 'Visit date label displayed');
    assert.ok(!isEmpty(find('.test-visit-date .test-visit-date-data').text()), 'Visit date is displayed');
    findWithAssert(`.primary-diagnosis:contains(${visitData.outPatient.PRIMARY_DIAGNOSIS})`);
    findWithAssert(`.secondary-diagnosis:contains(${visitData.outPatient.SECONDARY_DIAGNOSIS})`);
    findWithAssert('.test-opd-procedure .test-opd-procedure-label:contains(Procedures)');
    assert.ok(find('.test-opd-procedure .test-opd-procedure-data').text().indexOf(visitData.outPatient.OPD_PROCEDURE_DESCRIPTION) > -1, 'OPD Procedure is displayed');
    findWithAssert('.test-labs .test-labs-label:contains(Labs)');
    assert.ok(find('.test-labs .test-labs-data').text().indexOf(visitData.outPatient.LAB_TYPE) > -1, 'Lab request is displayed');
    findWithAssert('.test-images .test-images-label:contains(Images)');
    assert.ok(find('.test-images .test-images-data').text().indexOf(visitData.outPatient.IMAGING_TYPE) > -1, 'Image request is displayed');
    findWithAssert('.test-medication .test-medication-label:contains(Medications)');
    let medicationName = visitData.outPatient.MEDICATION_INPUT.slice(0, 30); // Medication name earlier filled-in contains other info not displayed in test, so only actual medication name is extracted
    assert.ok(find('.test-medication .test-medication-data').text().indexOf(medicationName) > -1, 'Medication request is displayed');
    // findWithAssert('.test-appointment .test-appointment-label:contains(Next Appointments)');
    // assert.ok(find('.test-appointment .test-appointment-data').text().indexOf(visitData.outPatient.APPOINTMENT_START_DATE) > -1, 'Next Appointment is displayed' + visitData.outPatient.APPOINTMENT_START_DATE);
    findWithAssert('.test-operative-plan .test-operative-plan-label:contains(Operative Plan)');
    findWithAssert('.test-operative-plan .test-operative-plan-description-label:contains(Operation Description:)');
    assert.equal(find('.test-operative-plan .test-operative-plan-description-data').text(), visitData.outPatient.OPERATION_DESCRIPTION);
    findWithAssert('.test-operative-plan .test-operative-plan-procedures-label:contains(Planned Procedures:)');
    assert.equal(find('.test-operative-plan .test-operative-plan-procedures-description').text(), visitData.outPatient.PROCEDURE_SPLINT);
    findWithAssert('.test-operative-plan .test-operative-plan-instructions-label:contains(Instructions upon Admission:)');
    assert.equal(find('.test-operative-plan .test-operative-plan-instructions-data').text(), visitData.outPatient.ADMISSION_INSTRUCTIONS, 'Admission Instruction is displayed');
  });
}

function dischargeReport(assert) {
  andThen(function() {
    assert.equal(find('.test-visit-date .test-visit-date-label').text().trim(), 'Admission Date:', 'Visit date label displays as admission');
    assert.equal(find('.test-visit-date .test-visit-discharge-date-label').text().trim(), 'Discharge Date:', 'Discharge date label displays');
  });
  andThen(function() {
    click('.panel-footer button:contains(Add)');
    waitToAppear('.modal-dialog');
  });
  andThen(function() {
    assert.equal(find('.modal-title').text(), 'Warning!!!!', 'Cant save discharge report without entering doctors name');
    click('button:contains(Ok)');
    waitToDisappear('.modal-dialog');
  });
  andThen(function() {
    typeAheadFillIn('.plan-surgeon', 'Dr Test');
  });
}

function saveReport(assert, type) {
  andThen(function() {
    click('.panel-footer button:contains(Add)');
    waitToAppear('.modal-dialog');
  });
  andThen(function() {
    assert.equal(find('.modal-title').text(), 'Report saved', `${type} report saved successfully`);
    click('button:contains(Ok)');
    waitToDisappear('.modal-dialog');
  });
  andThen(function() {
    assert.equal(find('.view-current-title').text(), `Edit ${type} Report`, 'Report title updated correctly');
    assert.ok(find('.panel-footer button:contains(Print)').is(':visible'), 'Print button is now visible');
    click('button:contains(Return)');
  });
  andThen(function() {
    assert.ok(currentURL().indexOf('visits/edit/') > -1, 'Visit url is correct');
  });
}

function editReport(assert, type) {
  andThen(function() {
    click('[data-test-selector=reports-tab]');
    waitToAppear('[data-test-selector=edit-report-btn]');
    click('[data-test-selector=edit-report-btn]');
  });
  andThen(function() {
    assert.ok(currentURL().indexOf('visits/reports/edit') > -1, 'Edit report url is correct');
    assert.equal(find('.patient-name .ps-info-data').text(), 'Joe Bagadonuts', 'Patient record displays');
    assert.equal(find('.view-current-title').text(), `Edit ${type} Report`, 'Edit report title displayed correctly');
    assert.ok(find('.panel-footer button:contains(Print)').is(':visible'), 'Print button is on edit visible');
  });
}

function updateVisitData(assert, modalTitle) {
  andThen(() => {
    click('.panel-footer button:contains(Add)');
    waitToAppear('.modal-dialog');
  });
  andThen(() => {
    assert.equal(find('.modal-title').text(), modalTitle, `${modalTitle} modal displays`);
    click('.modal-footer button:contains(Ok)');
  });
  andThen(function() {
    waitToDisappear('.modal-dialog');
  });
  andThen(() => {
    click('button:contains(Return)');
  });
  andThen(() => {
    assert.ok(currentURL().indexOf('visits/edit/') > -1, 'Returns back to visit URL');
  });
}

function updateVisit(assert, buttonText, visitType) {
  andThen(function() {
    if (visitType) {
      select('select[id*="visitType"]', visitType);
      waitToDisappear('label[for*="display_endDate"]');
    }
    click(`.panel-footer button:contains(${buttonText})`);
    waitToAppear('.modal-dialog');
  });
  andThen(function() {
    assert.equal(find('.modal-title').text(), 'Visit Saved', 'Visit Saved dialog displays');
    click('button:contains(Ok)');
  });
}
