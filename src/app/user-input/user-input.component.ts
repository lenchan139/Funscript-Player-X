import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {UserInputService} from './user-input.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {NotificationsService} from '../notifications.service';
import {FormBuilder} from '@angular/forms';

@UntilDestroy()
@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInputComponent implements OnInit {
  @ViewChild('videoInput')
  videoInput: any;
  @ViewChild('fsFileInput')
  fsFileInput: any;

  video: File | null = null;
  fs: File | null = null;

  urlForm = this.formBuilder.group({
    url: 'http://192.168.1.54:8096/emby/videos/598/stream.mp4',
  });

  constructor(
    public videoService: UserInputService,
    private notifications: NotificationsService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.getFSChange();
  }

  submitURL(): void {
    console.log(this.urlForm.getRawValue());
    this.videoService.videoURL.next(this.urlForm.controls.url.value);
  }

  onClickFileInputButton(type: 'video' | 'funscript'): void {
    if (type === 'video') {
      this.videoInput.nativeElement.click();
    }

    if (type === 'funscript') {
      this.fsFileInput.nativeElement.click();
    }
  }

  async onChangeFileInput(type: 'video' | 'funscript'): Promise<void> {
    if (type === 'video') {
      if (this.videoInput.nativeElement.files.length > 0) {
        const files: { [key: string]: File } =
          this.videoInput.nativeElement.files;
        this.video = files[0];
        const videoURL = URL.createObjectURL(files[0]);
        this.videoService.videoURL.next(videoURL);
        return this.notifications.showToast(`Loaded ${files[0].name}`, 'success');
      } else {
        return this.notifications.showToast(`Failed to load video.`, 'error');
      }
    }

    if (type === 'funscript') {
      if (this.fsFileInput.nativeElement.files.length > 0) {
        const files: { [key: string]: File } =
          this.fsFileInput.nativeElement.files;
        this.fs = files[0];
        return await this.fileToJSON(files[0]).then((r) => {
            this.videoService.funscriptURL.next(r);
            this.notifications.showToast(`Loaded ${files[0].name}`, 'success');
          }
        );
      } else {
        return this.notifications.showToast(`Failed to load funscript file.`, 'error');
      }
    }
  }

  // load user uploaded funscript file into a stringified object.
  private fileToJSON(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      // @ts-ignore
      fileReader.onload = (event) => resolve(JSON.parse(event.target.result));
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsText(file);
    });
  }

  private getFSChange(): void {
    this.videoService.funscriptURL
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val) {
          this.cdr.markForCheck();
        }
      });
  }
}
