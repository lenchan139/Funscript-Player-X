import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { UserInputService } from './user-input.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NotificationsService } from '../../../notifications.service';
import { BehaviorSubject } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-load-video',
  templateUrl: './load-video.component.html',
  styleUrls: ['./load-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LoadVideoComponent {
  constructor(
    public userInputService: UserInputService,
    private notifications: NotificationsService,
    public cdr: ChangeDetectorRef
  ) {}

  @ViewChild('videoInput')
  videoInput: any;
  video = new BehaviorSubject<File | undefined>(undefined);

  static getFileExtension(input: string | File): string {
    const element = typeof input === 'string' ? input : input.name;

    return element.substring(element.lastIndexOf('.') + 1);
  }

  // submit link method
  public submitURL(): void {
    this.userInputService.videoURL.next(
      this.userInputService.urlForm.controls.url.value
    );
    this.userInputService.mediaFormat.next('video')
  }

  // user upload method
  public onClickFileInputButton(): void {
    this.videoInput.nativeElement.click();
  }

  public async onChangeFileInput(): Promise<void> {
    if (this.videoInput.nativeElement.files.length > 0) {
      const files: { [key: string]: File } =
        this.videoInput.nativeElement.files;
      console.log('vv',files[0].type)
      if (!files[0].type.includes('video') && !files[0].type.includes('audio')) {
        return this.notifications.showToast(`Invalid video file.`, 'error');
      }

      this.video.next(files[0]);
      const videoURL = URL.createObjectURL(files[0]);
      this.userInputService.videoURL.next(videoURL);
      this.userInputService.mediaFormat.next(files[0].type.includes('audio') ? 'audio' : 'video')

      return this.notifications.showToast(`Loaded ${files[0].name}`, 'success');
    } else {
      return this.notifications.showToast(`Failed to load video.`, 'error');
    }
  }
}
