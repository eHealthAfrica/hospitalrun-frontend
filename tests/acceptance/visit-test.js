import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'hospitalrun/tests/helpers/start-app';

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
    newReport(assert, 'OPD');
    opdReport(assert);
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
      waitToAppear('td.charge-item-name');
    });
    andThen(function() {
      assert.equal(find('td.charge-item-name').text(), 'Gauze pad', 'New charge item appears');
    });
    updateVisit(assert, 'Update');
    andThen(function() {
      click('a.primary-diagnosis:contains(Broken Arm)');
      waitToAppear('.modal-dialog');
    });
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Edit Diagnosis', 'Edit Diagnosis modal appears');
      click('.modal-footer button:contains(Delete)');
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
      waitToDisappear('#visits td:contains(Fall from in-line roller-skates, initial encounter)');
    });
    andThen(function() {
      assert.equal(find('#visits tr').length, 1, 'Visit is deleted');
    });
  });
});

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
    updateVisit(assert, 'Add', type ? type : '');
  });

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

function dischargeReport(assert) {
  andThen(function() {
    assert.equal(find('[data-test-selector=visit-date-lbl]').text().trim(), 'Admission Date:', 'Visit date label displays as admission');
    assert.equal(find('[data-test-selector=discharge-date-lbl]').text().trim(), 'Discharge Date:', 'Discharge date label displays');
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

function opdReport(assert) {
  andThen(function() {
    assert.equal(find('[data-test-selector=visit-date-lbl]').text().trim(), 'Date of Visit:', 'Visit date label displays as opd');
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

