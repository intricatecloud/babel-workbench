const template = `
    <div class="modal modal-service hide"
        aria-hidden="false">
        <img id="image" class="lightbox-image"></img>
        <button ng-click="$ctrl.closeModal()" type="button" class="modal-close" alt="" aria-label="close">
            X
        </button>
    </div>`;

const bindings = {
  asset: '<',
  closeModal: '&',
  onModalOpen: '&',
};

class ModalComponent {
  $onInit() {
    this.modalIsOpen();
  }
}

export default {
  bindings,
  template,
  controller: ModalComponent,
};
